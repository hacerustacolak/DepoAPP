using Depo.Data.Models.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Vehicle
{
    public class VehicleModel : DbRecordBase
    {
        [StringLength(50)]
        public string ModelName { get; set; }
        public long VehicleBrandId { get; set; }
        public int MaintenancePeriodKM { get; set; }
        public int MaintenancePeriodYear { get; set; }
        [NotMapped]
        public string VehicleBrandName { get; set; }
    }
}
