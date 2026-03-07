using Backend.Models;

namespace Backend.Code
{
    public class AddTaskDTO
    {
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime? DueDate { get; set; }

        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    }
}