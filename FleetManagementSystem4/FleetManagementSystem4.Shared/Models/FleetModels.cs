using System;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace FleetManagementSystem4.Shared.Models;

[Table("vehicles")]
public class Vehicle : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;
    
    [Column("name")]
    public string Name { get; set; } = string.Empty;
    
    [Column("type")]
    public string Type { get; set; } = string.Empty;
    
    [Column("status")]
    public string Status { get; set; } = "Available";
    
    [Column("license_plate")]
    public string LicensePlate { get; set; } = string.Empty;
    
    [Column("capacity")]
    public int Capacity { get; set; }
    
    [Column("description")]
    public string Description { get; set; } = string.Empty;
    
    // 추가된 상세 정보
    [Column("fuel")]
    public string Fuel { get; set; } = string.Empty;
    
    [Column("color")]
    public string Color { get; set; } = string.Empty;
    
    [Column("year")]
    public int Year { get; set; }
    
    [Column("mileage")]
    public decimal Mileage { get; set; }
    
    [Column("last_maintenance")]
    public DateTime? LastMaintenance { get; set; }
    
    [Column("next_maintenance")]
    public DateTime? NextMaintenance { get; set; }
    
    [Column("insurance_expiry")]
    public DateTime? InsuranceExpiry { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}

[Table("reservations")]
public class Reservation : BaseModel
{
    [PrimaryKey("id")]
    public string Id { get; set; } = string.Empty;
    
    [Column("vehicle_id")]
    public string VehicleId { get; set; } = string.Empty;
    
    [Column("vehicle_name")]
    public string VehicleName { get; set; } = string.Empty;
    
    [Column("user_id")]
    public string UserId { get; set; } = string.Empty;
    
    [Column("user_name")]
    public string UserName { get; set; } = string.Empty;
    
    [Column("department")]
    public string Department { get; set; } = string.Empty;
    
    [Column("start_date")]
    public string StartDate { get; set; } = string.Empty;
    
    [Column("end_date")]
    public string EndDate { get; set; } = string.Empty;
    
    [Column("start_time")]
    public string StartTime { get; set; } = string.Empty;
    
    [Column("end_time")]
    public string EndTime { get; set; } = string.Empty;
    
    [Column("purpose")]
    public string Purpose { get; set; } = string.Empty;
    
    [Column("status")]
    public string Status { get; set; } = "reserved"; // reserved, in_use, completed, cancelled
    
    [Column("description")]
    public string Description { get; set; } = string.Empty;
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    
    // 현재 상태를 자동으로 계산하는 메서드
    public string GetCurrentStatus()
    {
        if (Status == "cancelled" || Status == "completed")
            return Status;
            
        var now = DateTime.Now;
        var startDateTime = StartDateTime;
        var endDateTime = EndDateTime;
        
        if (now < startDateTime)
            return "reserved"; // 예약 중
        else if (now >= startDateTime && now <= endDateTime)
            return "in_use"; // 사용 중
        else if (now > endDateTime)
            return "completed"; // 완료됨
        else
            return Status;
    }
    
    // 상태 텍스트 반환
    public string GetStatusText()
    {
        return GetCurrentStatus() switch
        {
            "reserved" => "예약 중",
            "in_use" => "사용 중", 
            "completed" => "완료됨",
            "cancelled" => "취소됨",
            _ => "알 수 없음"
        };
    }
    
    // 상태별 CSS 클래스
    public string GetStatusClass()
    {
        return GetCurrentStatus() switch
        {
            "reserved" => "bg-blue-100 text-blue-800",
            "in_use" => "bg-green-100 text-green-800",
            "completed" => "bg-purple-100 text-purple-800", 
            "cancelled" => "bg-red-100 text-red-800",
            _ => "bg-gray-100 text-gray-800"
        };
    }
    
    // Helper properties for DateTime operations - Supabase 직렬화에서 제외
    [System.Text.Json.Serialization.JsonIgnore]
    [Newtonsoft.Json.JsonIgnore]
    public DateTime StartDateTime
    {
        get
        {
            if (DateTime.TryParse($"{StartDate} {StartTime}", out DateTime result))
                return result;
            if (DateTime.TryParse(StartDate, out result))
                return result;
            return DateTime.MinValue;
        }
    }
    
    [System.Text.Json.Serialization.JsonIgnore]
    [Newtonsoft.Json.JsonIgnore]
    public DateTime EndDateTime
    {
        get
        {
            if (DateTime.TryParse($"{EndDate} {EndTime}", out DateTime result))
                return result;
            if (DateTime.TryParse(EndDate, out result))
                return result;
            return DateTime.MinValue;
        }
    }
    
    // 계산된 속성 - Supabase 직렬화에서 제외
    [System.Text.Json.Serialization.JsonIgnore]
    [Newtonsoft.Json.JsonIgnore]
    public TimeSpan Duration => EndDateTime - StartDateTime;
}

[Table("users")]
public class User : BaseModel
{
    [PrimaryKey("id", false)]
    public string Id { get; set; } = string.Empty;
    
    [Column("name")]
    public string Name { get; set; } = string.Empty;
    
    [Column("email")]
    public string Email { get; set; } = string.Empty;
    
    [Column("department")]
    public string Department { get; set; } = string.Empty;
    
    [Column("role")]
    public string Role { get; set; } = "User";
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
