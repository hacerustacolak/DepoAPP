using Depo.Data.Models.Common;

namespace Depo.Data.Models.Security
{
    public class UserRole : DbRecordBase
    {
        public long UserId { get; set; }
        public long RoleId { get; set; }
    }
}
