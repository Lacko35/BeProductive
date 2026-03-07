using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class TaskItem
    {
        [Key]
        [Column("task_id")]
        public int TaskID { get; set; }

        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("is_completed")]
        public bool IsCompleted { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("due_date")]
        public DateTime? DueDate { get; set; }

        [Column("finished_at")]
        public DateTime? FinishedAt { get; set; }

        [Column("priority")]
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;

        [Column("user_id")]
        public int UserProfileID { get; set; }

        public UserProfile? User { get; set; }        
    }

    public enum TaskPriority
    {
        Low = 0,
        Medium = 1,
        High = 2
    }
}