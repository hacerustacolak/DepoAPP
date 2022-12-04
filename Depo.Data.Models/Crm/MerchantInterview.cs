using Depo.Data.Models.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Depo.Data.Models.Crm
{
    public class MerchantInterview : DbRecordBase
    {
        [StringLength(100)]
        public string Title { get; set; }

        public DateTime InterviewDate { get; set; }

        public long InterviewTypeId { get; set; }

        public long MerchantContactId { get; set; }

        public long MerchantId { get; set; }

    }
    public class MerchantInterviewModel
    {
        public long Id { get; set; }
        public long MerchantId { get; set; }
        public long UserId { get; set; }
        public string Name { get; set; }
        public string InterviewType { get; set; }
        public DateTime InterviewDate { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public long MerchantContactId { get; set; }
        public long InterviewTypeId { get; set; }
    }
}
