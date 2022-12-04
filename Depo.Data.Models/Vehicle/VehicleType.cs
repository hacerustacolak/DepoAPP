using Depo.Data.Models.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Vehicle
{
    public class VehicleType : DbRecordBase
    {
        [StringLength(20)]
        public string TypeName { get; set; }
    }
}
