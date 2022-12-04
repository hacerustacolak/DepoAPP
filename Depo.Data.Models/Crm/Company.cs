using Depo.Data.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace Depo.Data.Models.Crm
{
    public class Company : DbRecordBase
    {
        [StringLength(255)]
        public string Name { get; set; }
        public long GroupId { get; set; }
        [StringLength(1000)]
        public string Description { get; set; }
    }

    public class CompanyView
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public long GroupId { get; set; }
        public string Description { get; set; }
        public string GroupName { get; set; }
        public bool IsActive { get; set; }
    }
}
