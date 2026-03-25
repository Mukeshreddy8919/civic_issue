package com.civic.smartcity.dto;

public class AdminAssignRequest {

    private Long grievanceId;
    private String assignedOfficer;
    private String department;
    private String priority;
    private String deadline;   // received as "YYYY-MM-DD" from the date input
    private String status;
    private String remarks;

    public Long getGrievanceId()              { return grievanceId; }
    public void setGrievanceId(Long v)        { this.grievanceId = v; }

    public String getAssignedOfficer()        { return assignedOfficer; }
    public void setAssignedOfficer(String v)  { this.assignedOfficer = v; }

    public String getDepartment()             { return department; }
    public void setDepartment(String v)       { this.department = v; }

    public String getPriority()               { return priority; }
    public void setPriority(String v)         { this.priority = v; }

    public String getDeadline()               { return deadline; }
    public void setDeadline(String v)         { this.deadline = v; }

    public String getStatus()                 { return status; }
    public void setStatus(String v)           { this.status = v; }

    public String getRemarks()                { return remarks; }
    public void setRemarks(String v)          { this.remarks = v; }
}