using Depo.Data.Models.Common;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Depo.Data.Models.Definitions
{
    public class City : DbRecordBase
    {
        [StringLength(100)]
        public string CityName { get; set; }
        public int CityPlateCode { get; set; }

        [StringLength(100)]
        public string CityPhoneCode { get; set; }

    }
}
