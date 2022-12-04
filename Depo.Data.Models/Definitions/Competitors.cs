using Depo.Data.Models.Common;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Depo.Data.Models.Definitions
{
    public class Competitors : DbRecordBase
    {
        [StringLength(150)]
        public string CompetitorName { get; set; }
    }
}
