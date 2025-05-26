#include "parse_tree.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Initial buffer size for JSON string
#define INITIAL_BUFFER_SIZE 1024

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
    
    size_t buffer_size = INITIAL_BUFFER_SIZE;
    char* result = malloc(buffer_size);
    if (result == NULL) {
        perror("malloc failed");
        return strdup("null"); // Return a default value or indicate error
    }
    result[0] = '\0';
    
    // Use a temporary buffer for snprintf to avoid writing directly to result in case of overflow
    size_t temp_buffer_size = INITIAL_BUFFER_SIZE;
    char* temp = malloc(temp_buffer_size);
     if (temp == NULL) {
        perror("malloc failed");
        free(result);
        return strdup("null"); // Return a default value or indicate error
    }

    // Start building the JSON string for the current node
    int len = snprintf(temp, temp_buffer_size, "{\"value\":\"%s\",\"type\":\"%s\"", root->value, root->type);
    if (len < 0) {
        perror("snprintf failed");
        free(result);
        free(temp);
        return strdup("null");
    }
    // Ensure temp buffer was large enough, reallocate if not (less likely for just one node's value/type)
    if (len >= temp_buffer_size) {
        temp_buffer_size = len + 1; // +1 for null terminator
        temp = realloc(temp, temp_buffer_size);
         if (temp == NULL) {
            perror("realloc failed");
            free(result);
            return strdup("null");
        }
         len = snprintf(temp, temp_buffer_size, "{\"value\":\"%s\",\"type\":\"%s\"", root->value, root->type);
    }
    
    // Append to result, reallocating result if needed
    size_t current_len = strlen(result);
    size_t required_len = current_len + strlen(temp) + 1; // +1 for null terminator
    if (required_len > buffer_size) {
        buffer_size = required_len + INITIAL_BUFFER_SIZE; // Grow buffer
        result = realloc(result, buffer_size);
         if (result == NULL) {
            perror("realloc failed");
            free(temp);
            return strdup("null");
        }
    }
    strcat(result, temp);

    // Add children if any
    if (root->num_children > 0) {
        current_len = strlen(result);
        required_len = current_len + strlen(",\"children\":[") + 1;
         if (required_len > buffer_size) {
            buffer_size = required_len + INITIAL_BUFFER_SIZE;
            result = realloc(result, buffer_size);
             if (result == NULL) {
                perror("realloc failed");
                free(temp);
                return strdup("null");
            }
        }
        strcat(result, ",\"children\":[");

        for (int i = 0; i < root->num_children; i++) {
            char* child_json = tree_to_json(root->children[i]);
            if (child_json == NULL || strcmp(child_json, "null") == 0) {
                 free(temp);
                 free(result);
                 free(child_json); // Free if not null
                 return strdup("null"); // Propagate error
            }

            current_len = strlen(result);
            required_len = current_len + strlen(child_json) + (i < root->num_children - 1 ? 1 : 0) + 1; // +1 for comma or null terminator
             if (required_len > buffer_size) {
                buffer_size = required_len + INITIAL_BUFFER_SIZE;
                result = realloc(result, buffer_size);
                 if (result == NULL) {
                    perror("realloc failed");
                    free(temp);
                    free(child_json);
                    return strdup("null");
                }
            }
            strcat(result, child_json);
            if (i < root->num_children - 1) {
                strcat(result, ",");
            }
            free(child_json);
        }

        current_len = strlen(result);
        required_len = current_len + strlen("]") + 1;
         if (required_len > buffer_size) {
            buffer_size = required_len + INITIAL_BUFFER_SIZE;
            result = realloc(result, buffer_size);
             if (result == NULL) {
                perror("realloc failed");
                free(temp);
                return strdup("null");
            }
        }
        strcat(result, "]");
    }
    
    current_len = strlen(result);
    required_len = current_len + strlen("}") + 1;
     if (required_len > buffer_size) {
        buffer_size = required_len + INITIAL_BUFFER_SIZE;
        result = realloc(result, buffer_size);
         if (result == NULL) {
            perror("realloc failed");
            free(temp);
            return strdup("null");
        }
    }
    strcat(result, "}");

    free(temp);
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