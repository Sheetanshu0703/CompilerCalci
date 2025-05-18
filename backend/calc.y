%code requires {
#include "parse_tree.h"
}
%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "parse_tree.h"

int yylex(void);
void yyerror(const char* s);

extern ParseNode* current_tree;
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
            char* json = tree_to_json($1);
            int result = eval_tree($1);
            printf("{\"result\":%d,\"parseTree\":%s}\n", result, json);
            free(json);
            free_tree($1);
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
