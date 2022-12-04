using Depo.Data.Models.Common;
using System.ComponentModel.DataAnnotations;


namespace Depo.Data.Models.Security
{
    public class Hierarchies : DbRecordBase
    {
        public long ParentId { get; set; }

        [StringLength(100)]
        public string Title { get; set; }

        [StringLength(100)]
        public string TitleDescription { get; set; }
    }
}
