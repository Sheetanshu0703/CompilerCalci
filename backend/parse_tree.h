#ifndef PARSE_TREE_H
#define PARSE_TREE_H

#include <stdlib.h>
#include <string.h>

typedef struct ParseNode {
    char* value;
    char* type;
    struct ParseNode** children;
    int num_children;
} ParseNode;

ParseNode* create_node(const char* value, const char* type);
void add_child(ParseNode* parent, ParseNode* child);
void free_tree(ParseNode* root);
char* tree_to_json(ParseNode* root);
int eval_tree(ParseNode* node);

#endif 