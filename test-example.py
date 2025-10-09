# Example Python file for testing code analysis
import math
from typing import List

def calculate_sum(a: float, b: float) -> float:
    """Calculate the sum of two numbers."""
    return a + b

def calculate_product(a: float, b: float) -> float:
    """Calculate the product of two numbers."""
    return a * b

class Calculator:
    """A simple calculator class with history tracking."""
    
    def __init__(self):
        self.history: List[str] = []
    
    def add(self, a: float, b: float) -> float:
        """Add two numbers and record in history."""
        result = calculate_sum(a, b)
        self.history.append(f"{a} + {b} = {result}")
        return result
    
    def multiply(self, a: float, b: float) -> float:
        """Multiply two numbers and record in history."""
        result = calculate_product(a, b)
        self.history.append(f"{a} * {b} = {result}")
        return result
    
    def get_history(self) -> List[str]:
        """Get calculation history."""
        return self.history.copy()

if __name__ == "__main__":
    calc = Calculator()
    print(calc.add(5, 3))
    print(calc.multiply(4, 7))
    print(calc.get_history())