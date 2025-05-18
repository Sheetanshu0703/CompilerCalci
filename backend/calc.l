%option noyywrap
%{
#include <stdio.h>
#include "calc.tab.h"
#include "parse_tree.h"
%}

%%

[0-9]+              { yylval.num = atoi(yytext); return NUMBER; }
"+"                 { return PLUS; }
"-"                 { return MINUS; }
"*"                 { return TIMES; }
"/"                 { return DIVIDE; }
"("                 { return LPAREN; }
")"                 { return RPAREN; }
[ \t]               ;  // ignore whitespace
\n                  { return '\n'; }
.                   { printf("Unexpected character: %s\n", yytext); }

%%
