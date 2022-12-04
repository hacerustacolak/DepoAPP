using Depo.Data.Models.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Depo.Data.Models.Security
{
    public class Otp : DbRecordBase
    {
        public long UserId { get; set; }

        [StringLength(7)]
        public string OtpCode { get; set; }

    }
}
