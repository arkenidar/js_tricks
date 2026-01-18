# evalInScope.py

"""
Python equivalent of JavaScript's eval-in-scope pattern.

JavaScript pattern (see evalInScope.js):
    function () { with (this) { return eval(js); }; }.call(contextAsScope)

Source reference:
    - JavaScript implementation: evalInScope.js
    - Original pattern: https://stackoverflow.com/a/25859853

This module provides a way to evaluate Python expressions with a custom scope,
similar to how JavaScript's 'with' statement temporarily adds object properties
to the scope chain for evaluation.
"""


def eval_in_scope(code, context_as_scope):
    """
    Evaluates Python code with variables from context_as_scope available.
    
    This is the Python equivalent to JavaScript's with statement pattern:
        function () { with (this) { return eval(js); }; }.call(contextAsScope)
    
    Args:
        code (str): Python expression or statement to evaluate
        context_as_scope (dict): Dictionary of variables to make available in the scope
    
    Returns:
        The result of evaluating the code with the provided context
    
    How it works:
        - Python's eval() accepts three arguments: eval(expression, globals, locals)
        - The second argument (globals) provides built-in functions like max(), min(), etc.
        - The third argument (locals) is where variables are looked up first
        - This achieves the same effect as JavaScript's 'with' statement
    
    Example:
        >>> eval_in_scope('a + b', {'a': 2, 'b': 3})
        5
        >>> eval_in_scope('max(x, y)', {'x': 10, 'y': 20})
        20
    """
    # Pass __builtins__ as globals so built-in functions are available
    # Pass context_as_scope as locals so custom variables are available
    return eval(code, {"__builtins__": __builtins__}, context_as_scope)


# Examples
print(eval_in_scope('a + b', {'a': 2, 'b': 3}))  # Outputs: 5
print(eval_in_scope('max(x, y)', {'x': 10, 'y': 20}))  # Outputs: 20

# Additional examples
scope = {'a': 11, 'b': 22, 'c': 33}
print(eval_in_scope('a + b + c', scope))  # Outputs: 66
print(eval_in_scope('b * 2', scope))  # Outputs: 44