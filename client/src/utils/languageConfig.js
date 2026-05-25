export const LANGUAGES = [
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: '🟨',
    monacoId: 'javascript',
    defaultCode: `// JavaScript – CompileHub
console.log("Hello, World!");

// Try some features
const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

console.log("Fibonacci(10):", fibonacci(10));`,
  },
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    monacoId: 'python',
    defaultCode: `# Python – CompileHub
print("Hello, World!")

# Try some features
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(f"Fibonacci(10): {fibonacci(10)}")`,
  },
  {
    id: 'cpp',
    name: 'C++',
    icon: '⚙️',
    monacoId: 'cpp',
    defaultCode: `// C++ – CompileHub
#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Hello, World!" << endl;
    cout << "Fibonacci(10): " << fibonacci(10) << endl;
    return 0;
}`,
  },
  {
    id: 'java',
    name: 'Java',
    icon: '☕',
    monacoId: 'java',
    defaultCode: `// Java – CompileHub
public class Main {
    static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Fibonacci(10): " + fibonacci(10));
    }
}`,
  },
  {
    id: 'c',
    name: 'C',
    icon: '🔧',
    monacoId: 'c',
    defaultCode: `// C – CompileHub
#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    printf("Hello, World!\\n");
    printf("Fibonacci(10): %d\\n", fibonacci(10));
    return 0;
}`,
  },
  {
    id: 'go',
    name: 'Go',
    icon: '🐹',
    monacoId: 'go',
    defaultCode: `// Go – CompileHub
package main

import "fmt"

func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}

func main() {
    fmt.Println("Hello, World!")
    fmt.Printf("Fibonacci(10): %d\\n", fibonacci(10))
}`,
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: '🦀',
    monacoId: 'rust',
    defaultCode: `// Rust – CompileHub
fn fibonacci(n: u32) -> u32 {
    if n <= 1 { return n; }
    fibonacci(n - 1) + fibonacci(n - 2)
}

fn main() {
    println!("Hello, World!");
    println!("Fibonacci(10): {}", fibonacci(10));
}`,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: '🔷',
    monacoId: 'typescript',
    defaultCode: `// TypeScript – CompileHub
const greeting: string = "Hello, World!";
console.log(greeting);

const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

console.log(\`Fibonacci(10): \${fibonacci(10)}\`);`,
  },
  {
    id: 'ruby',
    name: 'Ruby',
    icon: '💎',
    monacoId: 'ruby',
    defaultCode: `# Ruby – CompileHub
puts "Hello, World!"

def fibonacci(n)
  return n if n <= 1
  fibonacci(n - 1) + fibonacci(n - 2)
end

puts "Fibonacci(10): #{fibonacci(10)}"`,
  },
  {
    id: 'php',
    name: 'PHP',
    icon: '🐘',
    monacoId: 'php',
    defaultCode: `<?php
// PHP – CompileHub
echo "Hello, World!\\n";

function fibonacci($n) {
    if ($n <= 1) return $n;
    return fibonacci($n - 1) + fibonacci($n - 2);
}

echo "Fibonacci(10): " . fibonacci(10) . "\\n";
?>`,
  },
];

export const getLanguageById = (id) => {
  return LANGUAGES.find((lang) => lang.id === id) || LANGUAGES[0];
};

export const getDefaultCode = (languageId) => {
  const lang = getLanguageById(languageId);
  return lang.defaultCode;
};

export const getMonacoLanguage = (languageId) => {
  const lang = getLanguageById(languageId);
  return lang.monacoId;
};
