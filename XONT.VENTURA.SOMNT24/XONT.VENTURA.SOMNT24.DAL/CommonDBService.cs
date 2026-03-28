//// CommonDBService.cs
//using Microsoft.Data.SqlClient;
//using System;
//using System.Collections.Generic;
//using System.Data;

//namespace XONT.Common.Data
//{
//    public class CommonDBService : IDisposable
//    {
//        private SqlConnection _connection;

//        public void StartService()
//        {
//            _connection = new SqlConnection(CommonVar.DBConName.UserDB);
//            _connection.Open();
//        }

//        public void CloseService()
//        {
//            _connection?.Close();
//            _connection?.Dispose();
//            _connection = null;
//        }

//        public DataTable FillDataTable(string connectionName, string commandText, List<SPParameter> parameters)
//        {
//            using (var cmd = new SqlCommand(commandText, _connection))
//            {
//                cmd.CommandType = CommandType.StoredProcedure;
//                if (parameters != null)
//                {
//                    foreach (var p in parameters)
//                    {
//                        cmd.Parameters.AddWithValue(p.Name, p.Value ?? DBNull.Value);
//                    }
//                }

//                var dt = new DataTable();
//                using (var da = new SqlDataAdapter(cmd))
//                {
//                    da.Fill(dt);
//                }
//                return dt;
//            }
//        }

//        public int ExcecuteWithReturn(string connectionName, string commandText, List<SPParameter> parameters)
//        {
//            using (var cmd = new SqlCommand(commandText, _connection))
//            {
//                cmd.CommandType = CommandType.StoredProcedure;
//                if (parameters != null)
//                {
//                    foreach (var p in parameters)
//                    {
//                        cmd.Parameters.AddWithValue(p.Name, p.Value ?? DBNull.Value);
//                    }
//                }
//                return cmd.ExecuteNonQuery();
//            }
//        }

//        public void Dispose()
//        {
//            CloseService();
//        }
//    }
//}

// CommonDBService.cs
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;

namespace XONT.Common.Data
{
    public class CommonDBService : IDisposable
    {
        private SqlConnection _connection;

        public void StartService()
        {
            _connection = new SqlConnection(CommonVar.DBConName.UserDB);
            _connection.Open();
        }

        public void CloseService()
        {
            _connection?.Close();
            _connection?.Dispose();
            _connection = null;
        }

        // ── Shared helper ─────────────────────────────────────────────────────
        // AddWithValue() always infers SqlDbType from the .NET value type, which
        // causes "nvarchar → timestamp" errors for binary parameters.
        //
        // This helper checks if the caller explicitly set a SqlDbType on the
        // SPParameter. If yes → build SqlParameter manually to honour that type.
        // If no  → fall back to AddWithValue (existing behaviour, nothing breaks).
        private static void AddParameter(SqlCommand cmd, SPParameter p)
        {
            if (p.SqlDbType.HasValue)
            {
                // Caller pinned the type — build the parameter manually
                var sqlParam = new SqlParameter
                {
                    ParameterName = "@" + p.Name,   // SqlCommand accepts with or without @
                    SqlDbType = p.SqlDbType.Value,
                    Value = p.Value ?? DBNull.Value
                };

                // Honour explicit size when set (e.g. binary(8) needs Size = 8)
                if (p.Size.HasValue)
                    sqlParam.Size = p.Size.Value;

                cmd.Parameters.Add(sqlParam);
            }
            else
            {
                // No explicit type — original AddWithValue behaviour (safe for strings etc.)
                cmd.Parameters.AddWithValue(p.Name, p.Value ?? DBNull.Value);
            }
        }

        public DataTable FillDataTable(string connectionName, string commandText, List<SPParameter> parameters)
        {
            using (var cmd = new SqlCommand(commandText, _connection))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                if (parameters != null)
                {
                    foreach (var p in parameters)
                    {
                        AddParameter(cmd, p);   // ✅ replaces AddWithValue
                    }
                }
                var dt = new DataTable();
                using (var da = new SqlDataAdapter(cmd))
                {
                    da.Fill(dt);
                }
                return dt;
            }
        }

        public int ExcecuteWithReturn(string connectionName, string commandText, List<SPParameter> parameters)
        {
            using (var cmd = new SqlCommand(commandText, _connection))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                if (parameters != null)
                {
                    foreach (var p in parameters)
                    {
                        AddParameter(cmd, p);   // ✅ replaces AddWithValue
                    }
                }
                return cmd.ExecuteNonQuery();
            }
        }

        public void Dispose()
        {
            CloseService();
        }
    }
}