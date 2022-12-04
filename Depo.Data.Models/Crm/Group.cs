using Depo.Data.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace Depo.Data.Models.Crm
{
    public class Group : DbRecordBase
    {
        [StringLength(255)]
        public string Name { get; set; }
        [StringLength(1000)]
        public string Description { get; set; }

    }
}
