using Depo.Data.Models.Common;
using System.ComponentModel.DataAnnotations;

namespace Depo.Data.Models.Crm
{
    public class MerchantCurrentAccount : DbRecordBase
    {
        [StringLength(255)]
        public string Name { get; set; }
        public long MerchantId { get; set; }
        public long RegionId { get; set; }
        public bool IsDefault { get; set; }
        [StringLength(25)]
        public string IdentityNumber { get; set; }
        [StringLength(25)]
        public string TaxNumber { get; set; }
        [StringLength(50)]
        public string TaxOffice { get; set; }
        [StringLength(2000)]
        public string LogoCode { get; set; }
        [StringLength(25)]
        public string Phone { get; set; }
        [StringLength(50)]
        public string Email { get; set; }
    }
}
