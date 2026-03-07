using System.Globalization;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class StatisticController : ControllerBase
    {
        private readonly ApplicationContext applicationContext;

        public StatisticController(ApplicationContext app)
        {
            applicationContext = app;
        }

        [HttpGet("GetWeaklyStats/{weekKey}")]
        public async Task<ActionResult> GetWeaklyStats([FromRoute] string weekKey)
        {
            try
            {
                var username = User.Identity?.Name;

                if(username != null)
                {
                    var user = await applicationContext.Profiles.FirstOrDefaultAsync(u => u.Username == username);

                    if(user != null)
                    {
                        var parts = weekKey.Split('-');
                        
                        if (parts.Length != 2 || !int.TryParse(parts[0], out int year) || !int.TryParse(parts[1], out int week))
                        {
                            return BadRequest("Nevalidni weekKey format. Ocekivani: YYYY-WW");
                        }                        

                        var tasks = await applicationContext.Tasks
                        .Where(
                            t => t.UserProfileID == user.UserID && t.IsCompleted 
                            && t.FinishedAt.HasValue && t.FinishedAt.Value.Year == year
                        )
                        .ToListAsync();

                        var weeklyData = tasks.Where(t => ISOWeek.GetWeekOfYear(t.FinishedAt!.Value) == week)
                        .GroupBy(t => GetDayOfWeekNumber(t.FinishedAt!.Value))
                        .Select(g => new
                        {
                            dayOfWeek = g.Key,
                            count = g.Count()
                        })
                        .OrderBy(x => x.dayOfWeek)
                        .ToList();

                        return Ok(weeklyData);    
                    }
                    else
                    {
                        return BadRequest("Ne postoji korisnik sa zadatim username-om");
                    }
                }
                else
                {
                    return BadRequest("Ne postoji zadati username");
                }
            }
            catch(Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("GetMontlyStats/{year}")]
        public async Task<ActionResult> GetMontlyStats([FromRoute] int year)
        {
            try
            {
                var username = User.Identity?.Name;

                if(username != null)
                {
                    var user = await applicationContext.Profiles.FirstOrDefaultAsync(u => u.Username == username);

                    if(user != null)
                    {
                        var stats = await applicationContext.Tasks
                        .Where(
                            t => t.UserProfileID == user.UserID && t.IsCompleted 
                            && t.FinishedAt.HasValue && t.FinishedAt.Value.Year == year
                        )
                        .GroupBy(t => t.FinishedAt!.Value.Month)
                        .Select(g => new
                        {
                            month = g.Key,
                            count = g.Count()
                        })
                        .OrderBy(x => x.month)
                        .ToListAsync();

                        return Ok(stats);
                    }
                    else
                    {
                        return BadRequest("Ne postoji korisnik");
                    }
                }
                else
                {
                    return BadRequest("Ne postoji takav username");
                }
            }
            catch(Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        private int GetDayOfWeekNumber(DateTime date)
        {
            int day = (int)date.DayOfWeek;

            return day == 0 ? 7 : day;
        }
    }
}