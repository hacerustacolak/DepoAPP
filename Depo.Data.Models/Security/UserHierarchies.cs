using Depo.Data.Models.Common;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace Depo.Data.Models.Security
{
    public class UserHierarchies : DbRecordBase
    {
        public long UserId { get; set; }
        public long HierarchyId { get; set; }
    }

    public class UserHierarchiesModel
    {
        public long UserId { get; set; }
        public long HierarchyId { get; set; }

        public User User { get; set; }
        public Hierarchies Hierarchy { get; set; }
    }

    public class UserHierarchiesViewModel
    {
        public long Id { get; set; }
        public long ParentId { get; set; }
        public string Title { get; set; }
        public bool Selected { get; set; }
        public List<UserHierarchiesViewModel> ChildList { get; set; }
    }

    public class UserHierarchyModel
    {
        public int UserId { get; set; }
        public List<int> Hierarchies { get; set; }
    }

}
