%debug
%{
#include <stdio.h>
#include <stdlib.h>

int yylex(void);
void yyerror(const char* s);
%}

%token NUMBER
%token PLUS MINUS TIMES DIVIDE
%token LPAREN RPAREN

%left PLUS MINUS
%left TIMES DIVIDE

%%
input:
    expr '\n' { printf("%d\n", $1); }
;

expr:
    expr PLUS expr    { $$ = $1 + $3; }
  | expr MINUS expr   { $$ = $1 - $3; }
  | expr TIMES expr   { $$ = $1 * $3; }
  | expr DIVIDE expr  {
        if ($3 == 0) {
            yyerror("Division by zero");
            exit(1);
        }
        $$ = $1 / $3;
    }
  | LPAREN expr RPAREN { $$ = $2; }
  | NUMBER             { $$ = $1; }
;

%%

void yyerror(const char* s) {
    fprintf(stderr, "Error: %s\n", s);
}

int main() {
    yyparse();
    return 0;
}
int yywrap(){
    return 1;
}
