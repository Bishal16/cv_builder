package com.cvbuilder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GrammarRequest {

    @NotBlank
    @Size(max = 10000)
    private String text;
}
