#include "parse_tree.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

ParseNode* create_node(const char* value, const char* type) {
    ParseNode* node = (ParseNode*)malloc(sizeof(ParseNode));
    node->value = strdup(value);
    node->type = strdup(type);
    node->children = NULL;
    node->num_children = 0;
    return node;
}

void add_child(ParseNode* parent, ParseNode* child) {
    parent->num_children++;
    parent->children = realloc(parent->children, parent->num_children * sizeof(ParseNode*));
    parent->children[parent->num_children - 1] = child;
}

void free_tree(ParseNode* root) {
    if (root == NULL) return;
    
    for (int i = 0; i < root->num_children; i++) {
        free_tree(root->children[i]);
    }
    
    free(root->value);
    free(root->type);
    free(root->children);
    free(root);
}

char* tree_to_json(ParseNode* root) {
    if (root == NULL) return strdup("null");
    
    char* result = malloc(1024); // Initial buffer size
    char* temp = malloc(1024);
    result[0] = '\0';
    
    // Start node
    sprintf(result, "{\"value\":\"%s\",\"type\":\"%s\"", root->value, root->type);
    
    // Add children if any
    if (root->num_children > 0) {
        strcat(result, ",\"children\":[");
        for (int i = 0; i < root->num_children; i++) {
            char* child_json = tree_to_json(root->children[i]);
            strcat(result, child_json);
            if (i < root->num_children - 1) {
                strcat(result, ",");
            }
            free(child_json);
        }
        strcat(result, "]");
    }
    
    strcat(result, "}");
    return result;
}

int eval_tree(ParseNode* node) {
    if (!node) return 0;
    if (strcmp(node->type, "number") == 0) {
        return atoi(node->value);
    }
    if (strcmp(node->type, "operator") == 0 && node->num_children == 2) {
        int left = eval_tree(node->children[0]);
        int right = eval_tree(node->children[1]);
        if (strcmp(node->value, "+") == 0) return left + right;
        if (strcmp(node->value, "-") == 0) return left - right;
        if (strcmp(node->value, "*") == 0) return left * right;
        if (strcmp(node->value, "/") == 0) return right != 0 ? left / right : 0;
    }
    return 0;
} 