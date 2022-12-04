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
    public class VehicleCapacity : DbRecordBase
    {
        [StringLength(10)]
        public string CapacityName { get; set; }
        public long VehicleTypeId { get; set; }

        [NotMapped]
        public string VehicleTypeName { get; set; }
    }
}
