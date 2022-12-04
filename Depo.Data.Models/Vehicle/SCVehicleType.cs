using Depo.Data.Models.Common;
using System.ComponentModel.DataAnnotations;


namespace Depo.Data.Models.Vehicle
{
    public class SCVehicleType : DbRecordBase
    {
        [StringLength(50)]
        public string SCVehicleName { get; set; }
    }
}
