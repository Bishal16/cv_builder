package com.cvbuilder.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class PersonalInfo {
    private String name;
    private String email;
    private String phone;
    private String location;
    private String linkedinUrl;
    private String githubUrl;
    private String summary;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}