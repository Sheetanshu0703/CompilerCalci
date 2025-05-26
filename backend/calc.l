%option noyywrap
%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "calc.tab.h"
#include "parse_tree.h"
#include "lexer_defs.h"

// Define the variables declared in lexer_defs.h
Token* token_list = NULL;
int token_count = 0;

void add_token(const char* value, const char* type) {
    token_count++;
    token_list = realloc(token_list, token_count * sizeof(Token));
    token_list[token_count - 1].value = strdup(value);
    token_list[token_count - 1].type = strdup(type);
}

void free_tokens() {
    for (int i = 0; i < token_count; i++) {
        free(token_list[i].value);
        free(token_list[i].type);
    }
    free(token_list);
    token_list = NULL;
    token_count = 0;
}
%}

%%

[0-9]+              { yylval.num = atoi(yytext); add_token(yytext, "Constants"); return NUMBER; }
"+"                 { add_token("+", "Operators"); return PLUS; }
"-"                 { add_token("-", "Operators"); return MINUS; }
"*"                 { add_token("*", "Operators"); return TIMES; }
"/"                 { add_token("/", "Operators"); return DIVIDE; }
"("                 { add_token("(", "Punctuators"); return LPAREN; }
")"                 { add_token(")", "Punctuators"); return RPAREN; }
[ \t]               ;  // ignore whitespace
\n                  { return '\n'; }
.                   { printf("Unexpected character: %s\n", yytext); }

%%
