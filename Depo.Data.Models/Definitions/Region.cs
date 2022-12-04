using Depo.Data.Models.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;

namespace Depo.Data.Models.Definitions
{
    public class Region : DbRecordBase
    {
        [NotMapped]
        private List<long> _CityId;
        [NotMapped]
        public List<long> CityId
        {
            get
            {

                if (!string.IsNullOrEmpty(this.strCityIds))
                    _CityId = this.strCityIds.Split(',').Select(p => Convert.ToInt64(p)).ToList();

                return _CityId;
            }
            set
            {
                _CityId = value;
            }
        }

        [StringLength(255)]
        public string strCityIds { get; set; }

        [StringLength(255)]
        public string RegionName { get; set; }

        [StringLength(1000)]
        public string Address { get; set; }

        [StringLength(25)]
        public string PhoneNumber { get; set; }

    }

    public class RegionView
    {
        public long Id { get; set; }
        public string RegionName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string CityName { get; set; }
        public int CityPlateCode { get; set; }
        public string CityPhoneCode { get; set; }
        public bool IsActive { get; set; }
        public List<long> CityId { get; set; }
    }
}
