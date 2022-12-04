using Depo.Data.Models.Common;
using System.ComponentModel.DataAnnotations;


namespace Depo.Data.Models.Vehicle
{
    public class VehicleTrackingDeviceCompany : DbRecordBase
    {
        [StringLength(50)]
        public string VehicleTrackingDeviceCompanyName { get; set; }
    }
}
