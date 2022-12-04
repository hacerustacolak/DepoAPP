using Depo.Data.Models.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Depo.Data.Models.Crm
{
    public class MerchantContact : DbRecordBase
    {
        [StringLength(1000)]
        public string UserIdJson { get; set; }

        [NotMapped]
        private List<long> _UserId;
        [NotMapped]
        public List<long> UserId
        {
            get
            {

                if (!string.IsNullOrEmpty(this.UserIdJson))
                    _UserId = JsonConvert.DeserializeObject<List<long>>(this.UserIdJson);

                return _UserId;
            }
            set
            {
                _UserId = value;
            }
        }

        public long MerchantId { get; set; }
        
        [StringLength(100)]
        public string ContactPerson { get; set; }

        [StringLength(25)]
        public string ContactPhone { get; set; }

        [StringLength(100)]
        public string ContactEmail { get; set; }

        [StringLength(100)]
        public string ContactTitle { get; set; }

    }


}
