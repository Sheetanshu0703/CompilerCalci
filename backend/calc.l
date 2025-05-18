%{
#include "calc.tab.h"
#include <stdlib.h>
%}

%%

[0-9]+              { yylval = atoi(yytext); return NUMBER; }
[ \t]               ;  // ignore whitespace
\n                  { return '\n'; }
"+"                 { return PLUS; }
"-"                 { return MINUS; }
"*"                 { return TIMES; }
"/"                 { return DIVIDE; }
"("                 { return LPAREN; }
")"                 { return RPAREN; }

.                   { printf("Invalid character: %s\n", yytext); exit(1); }

%%
