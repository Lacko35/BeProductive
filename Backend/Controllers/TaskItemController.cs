using System.Security.Claims;
using Backend.Code;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class TaskItemController : ControllerBase
    {
        private readonly ApplicationContext appContext;

        public TaskItemController(ApplicationContext app)
        {
            appContext = app;
        }

        [HttpPost("AddTask")]
        public async Task<ActionResult> AddTask(AddTaskDTO dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow,
                DueDate = dto.DueDate,
                Priority = dto.Priority,
                UserProfileID = userId
            };

            await appContext.Tasks.AddAsync(task);
            await appContext.SaveChangesAsync();

            return Ok(task);
        }

        [HttpGet("GetTasks")]
        public async Task<ActionResult> GetTasks()
        {
            var userID = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var tasks = await appContext.Tasks
            .Where(t => t.UserProfileID == userID)
            .ToListAsync();

            if(tasks == null || tasks.Count == 0)
            {
                return BadRequest("Ne posedujete nikakve zadatke jos uvek, kreirajte neki!");
            }

            return Ok(tasks);
        }

        [HttpDelete("DeleteTask/{taskID}")]
        public async Task<ActionResult> DeleteTask([FromRoute] int taskID)
        {
            var userID = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var task = await appContext.Tasks.Where(t => t.UserProfileID == userID && t.TaskID == taskID).FirstOrDefaultAsync();            
        
            if(task == null)
            {
                return BadRequest("Task nije validan, ne postoji!");
            }

            appContext.Tasks.Remove(task);
            await appContext.SaveChangesAsync();

            return Ok("Uspesno obrisan task!");
        }

        [HttpPut("ChangeTask/{taskID}")]
        public async Task<ActionResult> ChangeTask([FromBody] UpdateTaskDTO dto, [FromRoute] int taskID)
        {
            var userID = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var task = await appContext.Tasks.Where(t => t.UserProfileID == userID && t.TaskID == taskID).FirstOrDefaultAsync();            
        
            if(task == null)
            {
                return BadRequest("Task nije validan, ne postoji!");
            }

            if(dto.DueDate != null)
            {
                task.DueDate = dto.DueDate;
            }

            task.Priority = dto.Priority;

            await appContext.SaveChangesAsync();

            return Ok("Izmene uspeno izvrsene!");
        }

        [HttpPut("FinishTask/{taskID}")]
        public async Task<ActionResult> FinishTask([FromRoute] int taskID)
        {
            var userID = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var task = await appContext.Tasks.Where(t => t.UserProfileID == userID && t.TaskID == taskID).FirstOrDefaultAsync();            
        
            if(task == null)
            {
                return BadRequest("Task nije validan, ne postoji!");
            }

            task.IsCompleted = true;
            task.FinishedAt = DateTime.UtcNow; 

            await appContext.SaveChangesAsync();

            return Ok("Izmene uspeno izvrsene!");           
        }
    }
}