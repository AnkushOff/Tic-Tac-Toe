import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Trophy, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Player = 'X' | 'O' | null;
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6] // diagonals
];

export function TicTacToeGame() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [gameCount, setGameCount] = useState({ X: 0, O: 0, draws: 0 });
  const [isDraw, setIsDraw] = useState(false);
  const { toast } = useToast();

  const checkWinner = (board: Board): { winner: Player; line: number[] } | null => {
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: [a, b, c] };
      }
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isDraw) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setGameCount(prev => ({
        ...prev,
        [result.winner!]: prev[result.winner!] + 1
      }));
      toast({
        title: `🎉 Player ${result.winner} Wins!`,
        description: "Great game! Ready for another round?",
      });
    } else if (newBoard.every(cell => cell !== null)) {
      setIsDraw(true);
      setGameCount(prev => ({ ...prev, draws: prev.draws + 1 }));
      toast({
        title: "🤝 It's a Draw!",
        description: "Well played! Try again for a winner.",
      });
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine([]);
    setIsDraw(false);
  };

  const resetStats = () => {
    setGameCount({ X: 0, O: 0, draws: 0 });
    resetGame();
  };

  const getCellContent = (index: number) => {
    const value = board[index];
    if (!value) return '';
    
    return (
      <span 
        className={`text-4xl font-bold animate-bounce-in ${
          value === 'X' 
            ? 'text-game-primary' 
            : 'text-game-secondary'
        }`}
      >
        {value}
      </span>
    );
  };

  const isCellWinning = (index: number) => winningLine.includes(index);

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-game-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Tic Tac Toe
            </h1>
          </div>
          
          {/* Score Board */}
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-game-grid">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-game-primary">{gameCount.X}</div>
                <div className="text-sm text-muted-foreground">Player X</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{gameCount.draws}</div>
                <div className="text-sm text-muted-foreground">Draws</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-game-secondary">{gameCount.O}</div>
                <div className="text-sm text-muted-foreground">Player O</div>
              </div>
            </div>
          </Card>

          {/* Current Player */}
          {!winner && !isDraw && (
            <div className="flex items-center justify-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg">Current Player:</span>
              <Badge 
                variant="outline" 
                className={`text-lg px-3 py-1 animate-pulse-game ${
                  currentPlayer === 'X' 
                    ? 'border-game-primary text-game-primary' 
                    : 'border-game-secondary text-game-secondary'
                }`}
              >
                {currentPlayer}
              </Badge>
            </div>
          )}

          {/* Game Status */}
          {(winner || isDraw) && (
            <div className="text-center">
              <div className={`text-2xl font-bold animate-glow ${
                winner === 'X' ? 'text-game-primary' : 
                winner === 'O' ? 'text-game-secondary' : 'text-game-accent'
              }`}>
                {winner ? `🎉 Player ${winner} Wins!` : '🤝 It\'s a Draw!'}
              </div>
            </div>
          )}
        </div>

        {/* Game Board */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-game-grid shadow-game">
          <div className="grid grid-cols-3 gap-2 p-2 bg-game-grid rounded-lg">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                className={`
                  aspect-square bg-game-cell rounded-lg border-2 border-transparent
                  flex items-center justify-center text-4xl font-bold
                  transition-all duration-300 ease-smooth
                  hover:bg-game-cell-hover hover:scale-105 hover:shadow-glow
                  focus:outline-none focus:ring-2 focus:ring-game-primary focus:ring-offset-2 focus:ring-offset-background
                  ${isCellWinning(index) ? 'bg-game-primary/20 border-game-primary animate-glow' : ''}
                  ${cell ? 'cursor-default' : 'cursor-pointer'}
                  ${!cell && !winner && !isDraw ? 'hover:border-game-primary/50' : ''}
                `}
                disabled={!!cell || !!winner || isDraw}
              >
                {getCellContent(index)}
              </button>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={resetGame}
            variant="outline"
            className="flex-1 bg-card/50 backdrop-blur-sm border-game-primary text-game-primary hover:bg-game-primary/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            New Game
          </Button>
          <Button
            onClick={resetStats}
            variant="outline"
            className="flex-1 bg-card/50 backdrop-blur-sm border-destructive text-destructive hover:bg-destructive/10"
          >
            Reset Stats
          </Button>
        </div>
      </div>
    </div>
  );
}