using Depo.Data.Models.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Depo.Data.Models.Crm
{
    public class MerchantInterviewType : DbRecordBase
    {
        [StringLength(100)]
        public string InterviewType { get; set; }

    }


}
