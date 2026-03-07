using Backend.Code;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserProfileController : ControllerBase
    {
        private readonly ApplicationContext context;

        public UserProfileController(ApplicationContext c)
        {
            context = c;
        }

        [HttpPut("ChangeUserProfile")]
        [Authorize]
        public async Task<ActionResult> ChangeUserProfile([FromBody] UpdateUserProfileDTO profile)
        {
            try
            {
                var username = User.Identity?.Name;

                if (username == null)
                {
                    return BadRequest("Username nije prosledjen kroz JWT token");
                }

                var user = await context.Profiles.FirstOrDefaultAsync(u => u.Username == username);

                if (user == null)
                {
                    return BadRequest("Korisnik nije prijavljen!");
                }

                if (profile.Username != String.Empty && !context.Profiles.Any(u => u.Username == profile.Username))
                {
                    user.Username = profile.Username!;
                }

                if (profile.Email != String.Empty && !context.Profiles.Any(u => u.Email == profile.Email))
                {
                    user.Email = profile.Email!;
                }

                if (profile.Password != String.Empty)
                {
                    user.HashPassword = BCrypt.Net.BCrypt.HashPassword(profile.Password);
                }

                if (profile.ProfilePicture != "")
                {
                    user.ProfilePicture = profile.ProfilePicture;
                }

                await context.SaveChangesAsync();

                return Ok("Uspesno izmenjeni podaci o korisnickom profilu!");
            }
            catch (Exception e)
            {
                return BadRequest("Greska: " + e.Message);
            }
        }

        [HttpDelete("DeleteUserProfile")]
        [Authorize]
        public async Task<ActionResult> DeleteUserProfile()
        {
            try
            {
                var username = User.Identity?.Name;

                if (username != null)
                {
                    var user = await context.Profiles.FirstOrDefaultAsync(u => u.Username == username);

                    if (user != null)
                    {
                        context.Profiles.Remove(user);
                        await context.SaveChangesAsync();

                        return Ok("Uspesno obrisan korisnik!");
                    }
                    else
                    {
                        return BadRequest("Korisnik ne postoji u bazi");
                    }
                }
                else
                {
                    return BadRequest("Korisnicko ime nije prepoznato");
                }
            }
            catch (Exception e)
            {
                return BadRequest("Greska: " + e.Message);
            }
        }

        [HttpGet("GetTopUsers")]
        public async Task<ActionResult> GetTopUsers()
        {
            try
            {
                var topUsers = await context.Profiles
                .Select(u => new
                {
                    Username = u.Username,
                    CompletedTasks = context.Tasks.Count(t => t.UserProfileID == u.UserID && t.IsCompleted)
                })
                .OrderByDescending(u => u.CompletedTasks)
                .Take(5)
                .ToListAsync();

                return Ok(topUsers);
            }
            catch (Exception e)
            {
                return BadRequest("Greska: " + e.Message);
            }
        }

        [HttpGet("GetProfilePicture")]
        [Authorize]
        public async Task<ActionResult> GetProfilePicture()
        {
            try
            {
                var username = User.Identity?.Name;

                if(username == null)
                    return Unauthorized();
                
                var user = await context.Profiles.FirstOrDefaultAsync(u => u.Username == username);

                if(username == null)
                    return BadRequest("Korisnik nije pronadjen!");

                return Ok(user?.ProfilePicture != null ? user.ProfilePicture : "");
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}