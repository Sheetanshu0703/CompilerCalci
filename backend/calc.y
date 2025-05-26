%code requires {
#include "parse_tree.h"
#include "lexer_defs.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
}
%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "parse_tree.h"

int yylex(void);
void yyerror(const char* s);

extern ParseNode* current_tree;
extern Token* token_list;
extern int token_count;
void free_tokens();

// Function to escape strings for JSON
char* escape_json_string(const char* str) {
    if (str == NULL) return strdup("");
    
    // Estimate required size (worst case: all characters need escaping)
    size_t len = strlen(str);
    size_t escaped_len = 0;
    for (size_t i = 0; i < len; i++) {
        switch (str[i]) {
            case '\"':
            case '\\':
            case '\b':
            case '\f':
            case '\n':
            case '\r':
            case '\t':
                escaped_len += 2; // \ followed by char
                break;
            default:
                if (str[i] < 32 || str[i] > 126) {
                     escaped_len += 6; // \uXXXX
                } else {
                    escaped_len += 1;
                }
                break;
        }
    }
    escaped_len += 1; // Null terminator

    char* escaped_str = malloc(escaped_len);
    if (escaped_str == NULL) {
        perror("malloc failed");
        return strdup(""); // Return empty string on error
    }

    char* current_pos = escaped_str;
    for (size_t i = 0; i < len; i++) {
        switch (str[i]) {
            case '\"': *current_pos++ = '\\'; *current_pos++ = '\"'; break;
            case '\\': *current_pos++ = '\\'; *current_pos++ = '\\'; break;
            case '\b': *current_pos++ = '\\'; *current_pos++ = 'b'; break;
            case '\f': *current_pos++ = '\\'; *current_pos++ = 'f'; break;
            case '\n': *current_pos++ = '\\'; *current_pos++ = 'n'; break;
            case '\r': *current_pos++ = '\\'; *current_pos++ = 'r'; break;
            case '\t': *current_pos++ = '\\'; *current_pos++ = 't'; break;
            default:
                 if (str[i] < 32 || str[i] > 126) {
                    sprintf(current_pos, "\\u%04x", (unsigned int)str[i]);
                    current_pos += 6;
                } else {
                    *current_pos++ = str[i];
                }
                break;
        }
    }
    *current_pos = '\0';
    
    return escaped_str;
}

%}

%union {
    int num;
    ParseNode* node;
}

%token <num> NUMBER
%token PLUS MINUS TIMES DIVIDE
%token LPAREN RPAREN

%left PLUS MINUS
%left TIMES DIVIDE

%type <node> expr

%%
input:
    expr '\n' {
        if ($1 == NULL) {
            printf("{\"error\":\"Invalid expression\"}\n");
        } else {
            char* parse_tree_json = tree_to_json($1);
            int result = eval_tree($1);
            
            // Estimate size for the full JSON string
            size_t total_len = snprintf(NULL, 0, "{\"result\":%d,\"parseTree\":%s,\"tokens\":[", result, parse_tree_json);
            for(int i=0; i<token_count; ++i) {
                char* escaped_value = escape_json_string(token_list[i].value);
                char* escaped_type = escape_json_string(token_list[i].type);
                total_len += snprintf(NULL, 0, "{\"value\":\"%s\",\"type\":\"%s\"}%s", escaped_value, escaped_type, i < token_count - 1 ? "," : "");
                free(escaped_value);
                free(escaped_type);
            }
            total_len += snprintf(NULL, 0, "]}");

            char* full_json = malloc(total_len + 1); // +1 for null terminator
            if (full_json == NULL) {
                perror("malloc failed for full JSON");
                printf("{\"error\":\"Internal server error\"}\n");
            } else {
                char* current_write_pos = full_json;
                current_write_pos += sprintf(current_write_pos, "{\"result\":%d,\"parseTree\":%s,\"tokens\":[", result, parse_tree_json);
                for(int i=0; i<token_count; ++i) {
                     char* escaped_value = escape_json_string(token_list[i].value);
                    char* escaped_type = escape_json_string(token_list[i].type);
                    current_write_pos += sprintf(current_write_pos, "{\"value\":\"%s\",\"type\":\"%s\"}%s", escaped_value, escaped_type, i < token_count - 1 ? "," : "");
                     free(escaped_value);
                    free(escaped_type);
                }
                sprintf(current_write_pos, "]}");

                printf("%s\n", full_json);
                free(full_json);
            }
            
            free(parse_tree_json);
            free_tree($1);
            free_tokens();
        }
    }
;

expr:
    expr PLUS expr    {
        if ($1 == NULL || $3 == NULL) {
            $$ = NULL;
        } else {
            ParseNode* node = create_node("+", "operator");
            add_child(node, $1);
            add_child(node, $3);
            $$ = node;
        }
    }
  | expr MINUS expr   {
        if ($1 == NULL || $3 == NULL) {
            $$ = NULL;
        } else {
            ParseNode* node = create_node("-", "operator");
            add_child(node, $1);
            add_child(node, $3);
            $$ = node;
        }
    }
  | expr TIMES expr   {
        if ($1 == NULL || $3 == NULL) {
            $$ = NULL;
        } else {
            ParseNode* node = create_node("*", "operator");
            add_child(node, $1);
            add_child(node, $3);
            $$ = node;
        }
    }
  | expr DIVIDE expr  {
        if ($1 == NULL || $3 == NULL) {
            $$ = NULL;
        } else if ($3->value && atoi($3->value) == 0) {
            yyerror("Division by zero");
            $$ = NULL;
        } else {
            ParseNode* node = create_node("/", "operator");
            add_child(node, $1);
            add_child(node, $3);
            $$ = node;
        }
    }
  | LPAREN expr RPAREN { $$ = $2; }
  | NUMBER {
        char num_str[32];
        sprintf(num_str, "%d", $1);
        $$ = create_node(num_str, "number");
    }
;

%%

void yyerror(const char* s) {
    fprintf(stderr, "Error: %s\n", s);
}

int main() {
    yyparse();
    return 0;
}
