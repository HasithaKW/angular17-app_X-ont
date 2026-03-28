// SPParameter.cs
using System.Data;

namespace XONT.Common.Data
{
    //public class SPParameter
    //{
    //    public string Name { get; set; }
    //    public object Value { get; set; }
    //}

    // SPParameter.cs — add these two properties if not already present
    public class SPParameter
    {
        public string Name { get; set; }
        public object Value { get; set; }

        // ✅ Nullable — when null, AddWithValue is used (no change for existing callers)
        public SqlDbType? SqlDbType { get; set; }

        // ✅ Nullable — only applied when SqlDbType is also set
        public int? Size { get; set; }
    }

}


