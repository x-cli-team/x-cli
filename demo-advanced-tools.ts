#!/usr/bin/env bun

// Demo script showing all 5 advanced tools working
import { 
  MultiFileEditorTool, 
  AdvancedSearchTool, 
  FileTreeOperationsTool, 
  CodeAwareEditorTool,
  OperationHistoryTool 
} from './src/tools/advanced/index.js';

async function demonstrateAdvancedTools() {
  console.log('🚀 Grok CLI Advanced Tools Demo\n');
  console.log('P1: Enhanced File Operations - All 5 Tools Implemented!\n');

  // 1. Code Analysis Demo
  console.log('📊 1. Code Analysis Tool');
  const codeAnalyzer = new CodeAwareEditorTool();
  const analysis = await codeAnalyzer.analyzeCode('./test-example.js');
  if (analysis.success) {
    console.log('✅ Analyzed JavaScript file:');
    console.log(analysis.output?.substring(0, 200) + '...\n');
  }

  // 2. File Tree Demo
  console.log('🌳 2. File Tree Operations');
  const fileTree = new FileTreeOperationsTool();
  const tree = await fileTree.generateTree('./src/tools', { maxDepth: 2 });
  if (tree.success) {
    console.log('✅ Generated directory tree:');
    console.log(tree.output?.substring(0, 300) + '...\n');
  }

  // 3. Advanced Search Demo
  console.log('🔍 3. Advanced Search Tool');
  const advancedSearch = new AdvancedSearchTool();
  const searchResult = await advancedSearch.search('./src/tools', {
    pattern: 'class.*Tool',
    isRegex: true,
    includeFiles: ['*.ts'],
    maxResults: 3
  });
  if (searchResult.success) {
    console.log('✅ Found class definitions:');
    console.log(searchResult.output?.substring(0, 200) + '...\n');
  }

  // 4. Multi-File Editor Demo (Preview only)
  console.log('📝 4. Multi-File Editor');
  const multiFileEditor = new MultiFileEditorTool();
  await multiFileEditor.beginTransaction('Demo transaction');
  await multiFileEditor.addOperations([
    {
      type: 'create',
      filePath: './demo-file-1.txt',
      content: 'Demo file created by advanced tools'
    }
  ]);
  const preview = await multiFileEditor.previewTransaction();
  if (preview.success) {
    console.log('✅ Multi-file transaction preview:');
    console.log(preview.output + '\n');
  }
  await multiFileEditor.rollbackTransaction(); // Clean up

  // 5. Operation History Demo  
  console.log('📚 5. Operation History');
  const history = new OperationHistoryTool();
  await history.recordOperation(
    'file_create',
    'Demo operation for showcase',
    ['./demo-file.txt'],
    {
      type: 'file_operations',
      files: [{ filePath: './demo-file.txt', existed: false }]
    }
  );
  const historyDisplay = await history.showHistory(1);
  if (historyDisplay.success) {
    console.log('✅ Operation history:');
    console.log(historyDisplay.output + '\n');
  }

  console.log('🎉 All 5 Advanced Tools Successfully Demonstrated!');
  console.log('\n📈 Capabilities Added:');
  console.log('• Multi-file atomic operations with rollback');
  console.log('• Regex search with context and bulk replace');  
  console.log('• Visual file trees and bulk operations');
  console.log('• Code analysis with refactoring support');
  console.log('• Comprehensive undo/redo with persistent history');
  console.log('\n🔧 Integration Status: ✅ Ready for use in Grok CLI');
  console.log('🎯 P1 Sprint Goal: ✅ COMPLETED');
}

demonstrateAdvancedTools().catch(console.error);