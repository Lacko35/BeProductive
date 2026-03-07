using Backend.Models;

namespace Backend.Code
{
    public class UpdateTaskDTO
    {
        public DateTime? DueDate { get; set; }

        public TaskPriority Priority { get; set; }
    }
}