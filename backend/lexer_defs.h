#ifndef LEXER_DEFS_H
#define LEXER_DEFS_H

// Declare the Token structure
typedef struct {
    char* value;
    char* type;
} Token;

// Declare the external variables and functions from the lexer
extern Token* token_list;
extern int token_count;
void free_tokens();

#endif // LEXER_DEFS_H 