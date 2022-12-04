using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Common
{
    public class DbRecordBase
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set;}
        public DateTime CreateDate { get; set; } = DateTime.UtcNow;
        public DateTime ModifiedDate { get; set; } = DateTime.UtcNow;
        public long CreatorUserId { get; set; } = 0;
        public long ModifierUserId { get; set; } = 0;
        public bool IsDeleted { get; set; } = false;
        public bool IsActive { get; set; } = true;

        [StringLength(2500)]
        public string Description { get; set; }
    }
}
