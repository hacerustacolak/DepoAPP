using System.Collections.Generic;

namespace Depo.Data.Models.Security
{ 
    public class HierarchiesQuery
    {
        public string SearchText { get; set; }
    }
    public class HierarchiesModel
    {
        public long Id { get; set; }
        public long ParentId { get; set; }
        public string Title { get; set; }
        public string TitleDescription { get; set; }
        public List<HierarchiesModel> xlHierarchiesModel { get; set; }
    }
}
