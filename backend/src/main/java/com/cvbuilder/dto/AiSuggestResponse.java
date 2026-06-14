package com.cvbuilder.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiSuggestResponse {
    private List<String> suggestions;
}
