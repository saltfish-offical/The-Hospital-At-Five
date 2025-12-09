import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, RoomType, PlayerState, LogEntry, Item, FloorData, DialogData } from './types';
import { FLOORS, ITEMS_DB, INITIAL_TIME_MINUTES, DEADLINE_MINUTES } from './constants';
import { audio } from './services/audioService';
import { Typewriter } from './components/Typewriter';
import { 
  Heart, Brain, Clock, Search, DoorOpen, Skull, 
  Ghost, Briefcase, FileText, Lock, MessageSquare, ArrowRight 
} from 'lucide-react';

// --- Components ---

const PlayerSprite = ({ facing }: { facing: 'left' | 'right' }) => (
  <svg width="60" height="120" viewBox="0 0 60 120" className={`transform transition-transform duration-200 ${facing === 'left' ? 'scale-x-[-1]' : ''}`}>
    <path d="M45 45 L250 -40 L250 140 Z" fill="url(#flashlight-grad)" opacity="0.6" className="mix-blend-overlay" />
    <defs>
      <linearGradient id="flashlight-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </linearGradient>
    </defs>
    <g filter="drop-shadow(0 0 5px rgba(0,0,0,0.8))">
      <rect x="20" y="70" width="8" height="50" fill="#0a0a0a" />
      <rect x="32" y="70" width="8" height="50" fill="#0a0a0a" />
      <rect x="15" y="35" width="30" height="40" rx="2" fill="#3f1a1a" stroke="#000" />
      <circle cx="30" cy="20" r="12" fill="#888" />
    </g>
  </svg>
);

const DoctorSprite = ({ level }: { level: number }) => (
  <svg width="100" height="160" viewBox="0 0 80 140" className="animate-pulse">
    <g filter="drop-shadow(0 0 15px rgba(200,0,0,0.5))">
      <path d="M15 100 L20 30 L60 30 L65 100 L40 115 Z" fill="#e0e0e0" stroke="#000" strokeWidth="2" />
      <path d="M25 40 Q35 50 25 80" stroke="#8a0000" strokeWidth="5" strokeLinecap="round" />
      <circle cx="40" cy="20" r="14" fill="#fff" stroke="#000" />
      <path d="M30 18 L50 18" stroke="black" strokeWidth="3" /> {/* Mask */}
      <circle cx="35" cy="15" r="2" fill="red" />
      <circle cx="45" cy="15" r="2" fill="red" />
    </g>
  </svg>
);

const CinematicIntro = ({ onComplete }: { onComplete: () => void }) => {
    const [page, setPage] = useState(0);
    
    const pages = [
        // Page 1
        <div className="space-y-8 text-center max-w-2xl">
            <p className="text-xl text-red-500 font-bold tracking-widest">“当下午五点的钟声响起，医院的规则将会改变——而你，已经错过了离开的时间。”</p>
            <div className="space-y-4 text-zinc-400">
                <p>你记得自己是来看病的。</p>
                <p>妈妈接了个电话，说马上回来。</p>
                <p>然后门锁上了。</p>
            </div>
            <div className="bg-red-900/10 p-6 border border-red-900/30 text-red-300 italic">
                书桌上出现了一张不属于这里的纸条：<br/>
                “欢迎来到诡异医院。请在下午5点前找到厕所并进入。”
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-500">
                <div>一把生锈的手枪。</div>
                <div>一个发硬的面包。</div>
                <div>一瓶浑浊的水。</div>
                <div>一个永远指向4:30的时钟。</div>
            </div>
        </div>,
        // Page 2
        <div className="space-y-6 text-center max-w-2xl">
            <h2 className="text-3xl text-red-600 font-horror mb-8">你将面对什么</h2>
            <div className="space-y-4 text-lg">
                <p><span className="text-red-400">时间</span>，是你的第一个敌人。</p>
                <p className="text-sm text-zinc-500">每60秒，医院时间前进1分钟。</p>
                <p className="text-sm text-zinc-500">下午5点是分界线——之前是医院，之后是地狱。</p>
            </div>
            <div className="border-t border-red-900/30 my-4"></div>
            <div className="space-y-4 text-lg">
                <p><span className="text-red-400">医生</span>，不再是救你的人。</p>
                <p className="text-sm text-zinc-500">他们穿着白大褂，但口罩下没有脸。</p>
            </div>
            <div className="border-t border-red-900/30 my-4"></div>
            <div className="space-y-4 text-lg">
                <p><span className="text-red-400">厕所</span>，是最安全也最危险的地方。</p>
                <p className="text-sm text-zinc-500">5点前：可以恢复生命，是唯一的避风港。</p>
                <p className="text-sm text-zinc-500">5点后：敲门声会响起...</p>
            </div>
        </div>,
        // Page 3
        <div className="space-y-8 text-center max-w-2xl">
            <h2 className="text-3xl text-red-600 font-horror">你需要做什么</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-zinc-900/50 p-4 border border-zinc-800">
                    <h3 className="text-xl text-yellow-500 mb-2">收集</h3>
                    <ul className="text-sm text-zinc-400 space-y-2">
                        <li>• 金币：购买物资</li>
                        <li>• 钥匙：解锁电梯</li>
                        <li>• 信息：病历、录音、日志</li>
                    </ul>
                </div>
                <div className="bg-zinc-900/50 p-4 border border-zinc-800">
                    <h3 className="text-xl text-red-500 mb-2">抉择</h3>
                    <ul className="text-sm text-zinc-400 space-y-2">
                        <li>• 战斗还是逃跑？</li>
                        <li>• 开门还是不开门？</li>
                        <li>• 相信妈妈还是相信自己？</li>
                    </ul>
                </div>
                <div className="bg-zinc-900/50 p-4 border border-zinc-800">
                    <h3 className="text-xl text-green-500 mb-2">生存</h3>
                    <ul className="text-sm text-zinc-400 space-y-2">
                        <li>• 初始5点生命值</li>
                        <li>• 利用面包、绷带恢复</li>
                        <li>• 升级手枪、宠物</li>
                    </ul>
                </div>
            </div>
            <p className="text-xl text-red-400 animate-pulse mt-8">在下午5点的钟声响起前，找到你的位置。</p>
        </div>,
        // Page 4
        <div className="space-y-8 text-center max-w-2xl">
            <h2 className="text-4xl text-red-600 font-horror animate-glitch">特别警告</h2>
            <div className="space-y-6 text-lg text-zinc-300">
                <p>不要相信所有白大褂——有些医生想帮你，有些想成为你。</p>
                <p>金币的声音会吸引注意——但有时候你需要冒险。</p>
                <p>高层的美味可能是毒药——免费的面包通常代价更高。</p>
                <p className="text-red-500 font-bold">妈妈的呼唤可能是陷阱——你记得她手腕上那条伤疤的形状吗？</p>
                <p className="text-sm italic text-zinc-600">医院的钟偶尔倒着走——当它倒走时，规则暂时失效。</p>
            </div>
        </div>,
        // Page 5
        <div className="space-y-12 text-center max-w-2xl relative">
            <h2 className="text-3xl text-white font-serif">最后的问题</h2>
            <div className="space-y-6 text-xl text-zinc-400">
                <p>当下午5点的钟声响起，敲门声传来时，你会开门吗？</p>
                <p>当你发现医院的真相与你的记忆不符时，你会相信哪个？</p>
                <p>当你终于可以离开时，你真的还想走吗？</p>
            </div>
            
            <div className="mt-12 p-8 border-2 border-red-800 bg-black">
                <div className="text-2xl text-red-600 mb-4 font-bold">游戏现在开始</div>
                <div className="grid grid-cols-2 gap-4 text-left font-mono text-red-400">
                    <div>时间：4:31</div>
                    <div>生命值：5/5</div>
                    <div>金币：10</div>
                    <div>目标：在29分钟内找到厕所，或者找到真相</div>
                </div>
            </div>
            
            <p className="text-sm text-zinc-600 animate-pulse">记住：诡异医院不在任何地图上，但它一直在等你。</p>
        </div>
    ];

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 cursor-pointer" onClick={() => {
            if (page < pages.length - 1) setPage(p => p + 1);
            else onComplete();
            audio.playBeep(200, 'sine', 0.1);
        }}>
            <div className="vhs-noise"></div>
            <div className="scanline"></div>
            <div className="cinema-fade-in w-full flex justify-center">
                {pages[page]}
            </div>
            <div className="absolute bottom-8 text-zinc-600 text-sm animate-pulse">
                [ 点击屏幕继续 ]
            </div>
        </div>
    );
};

// --- Main App ---

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [player, setPlayer] = useState<PlayerState>({
    hp: 5,
    maxHp: 5,
    sanity: 100,
    gold: 10,
    floor: 1,
    x: 100,
    facing: 'right',
    inventory: [
      { ...ITEMS_DB['gun'], quantity: 1 },
      { ...ITEMS_DB['bread'], quantity: 1 },
      { ...ITEMS_DB['water'], quantity: 1 },
      { ...ITEMS_DB['clock'], quantity: 1 }
    ],
    weaponLevel: 1,
    pets: [],
    toiletLevel: 0,
    time: INITIAL_TIME_MINUTES + 1, // Start 16:31
    flags: {},
    lastCombatTime: 0
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeEnemy, setActiveEnemy] = useState<any>(null);
  const [activeRoom, setActiveRoom] = useState<RoomType | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<Item | null>(null); // For reading files
  const [dialogData, setDialogData] = useState<DialogData | null>(null);
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const currentFloor = FLOORS.find(f => f.level === player.floor) || FLOORS[0];

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Time Limit Check
  useEffect(() => {
    if ((phase === GamePhase.EXPLORATION || phase === GamePhase.ROOM_VIEW) && player.time >= DEADLINE_MINUTES) {
        handle5PMEvent();
    }
  }, [player.time, phase]);

  const addLog = useCallback((text: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev.slice(-20), {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type,
      timestamp: formatTime(player.time)
    }]);
  }, [player.time]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const advanceTime = (mins: number) => {
      setPlayer(p => ({ ...p, time: p.time + mins }));
  };

  const handle5PMEvent = () => {
      setPhase(GamePhase.EVENT_5PM);
      audio.playDrone();
      
      if (activeRoom === RoomType.TOILET) {
          addLog("当——当——当—— 五点的钟声响了。", "story");
          setTimeout(() => {
              setDialogData({
                  speaker: "门外",
                  text: "咚... 咚... 咚... (急促的敲门声) '小宝？是你吗？妈妈回来了，快开门！'",
                  options: [
                      { text: "开门 (50% 存活)", action: () => resolveKnock(true) },
                      { text: "不开门 (安全)", action: () => resolveKnock(false) }
                  ]
              });
              setPhase(GamePhase.DIALOG);
          }, 2000);
      } else {
          setPhase(GamePhase.GAME_OVER);
          addLog("你没有在五点前找到厕所。黑暗吞噬了你。", "danger");
      }
  };

  const resolveKnock = (opened: boolean) => {
      if (!opened) {
          addLog("你屏住呼吸，门外的声音渐渐消失了。你活过了这个时刻。", "success");
          setPlayer(p => ({ ...p, time: p.time + 1 })); // Advance past 17:00
          setPhase(GamePhase.ROOM_VIEW);
          setDialogData(null);
      } else {
          // 50/50 chance
          if (Math.random() > 0.5) {
               addLog("门开了，是妈妈！她把你拉出了医院。", "success");
               setPhase(GamePhase.VICTORY);
          } else {
               addLog("门开了... 那不是妈妈。那是一张没有五官的脸。", "danger");
               setPhase(GamePhase.GAME_OVER);
          }
      }
  };

  // Input Handling
  useEffect(() => {
    if (phase !== GamePhase.EXPLORATION) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 30;
      if (e.key === 'ArrowRight' || e.key === 'd') {
        setPlayer(p => {
            const nextX = Math.min(currentFloor.length, p.x + step);
            // Move time slightly with distance
            const timePassed = Math.floor(nextX / 200) - Math.floor(p.x / 200) > 0 ? 1 : 0;
            return { ...p, x: nextX, facing: 'right', time: p.time + timePassed };
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        setPlayer(p => ({ ...p, x: Math.max(0, p.x - step), facing: 'left' }));
      } else if (e.key === ' ' || e.key === 'Enter') {
        interact();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentFloor, player.x]);

  const interact = () => {
    const nearest = currentFloor.entities.find(e => Math.abs(e.x - player.x) < 60);
    if (!nearest) return;

    if (nearest.type === 'DOOR') {
      enterRoom(nearest.data as RoomType);
    } else if (nearest.type === 'ITEM') {
      collectItem(nearest.data as string);
    } else if (nearest.type === 'NPC') {
        handleNPC(nearest.data);
    }
  };

  const handleNPC = (npcId: string) => {
      if (npcId === 'ALIEN') {
          setDialogData({
              speaker: "？？？",
              text: "这里是镜像位面。你身上有人类的气味。你想回到那个蓝色的星球吗？",
              options: [
                  { text: "我想回家", action: () => {
                      addLog("一阵强光闪过...", "story");
                      setPhase(GamePhase.VICTORY);
                  }},
                  { text: "我想留下", action: () => {
                      addLog("你选择留在这个虚无的空间。", "story");
                      setPhase(GamePhase.GAME_OVER);
                  }}
              ]
          });
          setPhase(GamePhase.DIALOG);
      }
  };

  const collectItem = (id: string) => {
      const item = ITEMS_DB[id];
      if (item) {
        setPlayer(prev => ({ ...prev, inventory: [...prev.inventory, { ...item, quantity: 1 }] }));
        addLog(`获得物品: ${item.name}`, "success");
        // Remove item from world visually would require state update of floor entities, simplified here
        audio.playBeep(800, 'sine', 0.1);
      }
  };

  const useItem = (item: Item) => {
      if (item.type === 'FILE') {
          setActivePuzzle(item);
          setPhase(GamePhase.PUZZLE);
      } else if (item.type === 'HEALING') {
          setPlayer(p => ({ ...p, hp: Math.min(p.maxHp, p.hp + item.value) }));
          addLog(`使用了 ${item.name}，生命值恢复。`, "success");
      }
  };

  const enterRoom = (room: RoomType) => {
    audio.playBeep(100, 'square', 0.2);
    advanceTime(1);

    if (room === RoomType.ELEVATOR) {
        const nextFloor = player.floor + 1;
        setPlayer(p => ({ ...p, floor: nextFloor, x: 100 }));
        addLog(`进入第 ${nextFloor} 层...`, "system");
    } else {
        setActiveRoom(room);
        setPhase(GamePhase.ROOM_VIEW);
    }
  };

  const roomAction = (action: 'search' | 'rest') => {
      advanceTime(3);
      if (action === 'search') {
          if (Math.random() > 0.5) {
              const gold = Math.floor(Math.random() * 20) + 5;
              setPlayer(p => ({...p, gold: p.gold + gold}));
              addLog(`找到了 ${gold} 金币。`, "success");
          } else {
              addLog("什么也没找到。", "info");
          }
      }
  };

  // --- Renderers ---

  if (phase === GamePhase.MENU) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
        <div className="vhs-noise"></div>
        <div className="scanline"></div>
        <h1 className="text-7xl font-horror text-red-600 mb-4 animate-shake text-center tracking-tighter">
          诡异医院
          <br/>
          <span className="text-4xl text-red-800 tracking-[0.5em] font-serif">五点钟声</span>
        </h1>
        <button 
          onClick={() => {
              setPhase(GamePhase.INTRO);
              audio.playDrone();
          }}
          className="mt-12 px-12 py-4 border border-red-800 text-red-500 hover:bg-red-900/20 hover:text-red-300 transition-all text-xl tracking-widest"
        >
          开始游戏
        </button>
      </div>
    );
  }

  if (phase === GamePhase.INTRO) {
      return <CinematicIntro onComplete={() => setPhase(GamePhase.EXPLORATION)} />;
  }

  if (phase === GamePhase.DIALOG && dialogData) {
      return (
          <div className="h-screen w-full bg-black flex items-center justify-center p-8 relative z-50">
              <div className="red-vignette"></div>
              <div className="max-w-3xl w-full border-2 border-zinc-800 bg-zinc-950/90 p-8 shadow-2xl">
                  <div className="text-red-500 text-xl font-bold mb-4">{dialogData.speaker}</div>
                  <p className="text-2xl text-zinc-300 mb-12 leading-relaxed font-serif">{dialogData.text}</p>
                  <div className="flex flex-col gap-4">
                      {dialogData.options.map((opt, i) => (
                          <button key={i} onClick={opt.action} className="p-4 border border-zinc-700 hover:bg-red-900/30 hover:border-red-500 text-left transition-all text-lg">
                              {i + 1}. {opt.text}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  if (phase === GamePhase.PUZZLE && activePuzzle) {
      return (
          <div className="h-screen w-full bg-black/90 flex items-center justify-center p-8 z-50 absolute top-0">
              <div className="bg-[#1a1a1a] p-8 max-w-lg w-full border border-zinc-700 shadow-2xl relative">
                  <button className="absolute top-4 right-4 text-zinc-500 hover:text-white" onClick={() => setPhase(GamePhase.EXPLORATION)}>✕</button>
                  <h2 className="text-2xl text-red-500 mb-6 flex items-center gap-2">
                      <FileText /> {activePuzzle.name}
                  </h2>
                  <div className="font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed bg-black p-4 border border-zinc-800">
                      {activePuzzle.content}
                  </div>
                  <div className="mt-6 text-sm text-zinc-600 text-center">仔细阅读，线索可能隐藏在其中...</div>
              </div>
          </div>
      );
  }

  if (phase === GamePhase.VICTORY || phase === GamePhase.GAME_OVER) {
      return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-center p-8">
            <h1 className={`text-6xl font-serif mb-6 ${phase === GamePhase.VICTORY ? 'text-white' : 'text-red-800'}`}>
                {phase === GamePhase.VICTORY ? "结局：逃离" : "结局：同化"}
            </h1>
            <p className="text-zinc-500 text-xl max-w-2xl">
                {phase === GamePhase.VICTORY 
                    ? "你设法离开了这个地方。但当你回头看时，那里只有一片荒芜的空地。" 
                    : "你成为了医院的一部分。现在，你也开始期待下午五点的钟声了。"}
            </p>
            <button onClick={() => window.location.reload()} className="mt-12 text-red-500 border-b border-red-500 pb-1 hover:text-red-300">
                重新开始轮回
            </button>
        </div>
      );
  }

  // --- Main HUD & Viewport ---

  return (
    <div className="h-screen w-full bg-black text-zinc-300 flex flex-col font-serif overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 border-b border-[#300] bg-black flex items-center justify-between px-6 z-20">
        <div className="flex gap-6 items-center">
            <span className="text-red-600 font-bold text-xl tracking-widest">{player.floor}F // {currentFloor.name}</span>
            <span className="text-xs text-zinc-600 hidden md:inline">{currentFloor.dangerTitle}</span>
        </div>
        <div className="flex gap-6 font-mono text-lg">
             <div className="flex items-center gap-2 text-red-500"><Heart className="w-5 h-5 fill-current" /> {player.hp}</div>
             <div className="flex items-center gap-2 text-yellow-500"><Clock className="w-5 h-5" /> {formatTime(player.time)}</div>
        </div>
      </div>

      {/* Game View */}
      <div className="flex-1 relative bg-[#050000]">
          <div className="red-vignette"></div>
          
          {phase === GamePhase.ROOM_VIEW ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative p-8">
                  <div className="text-center mb-12 z-10">
                      <h2 className="text-5xl text-red-600 font-horror mb-2">{activeRoom}</h2>
                      <p className="text-zinc-500">{activeRoom === RoomType.TOILET ? "暂时安全" : "感到不安"}</p>
                  </div>
                  <div className="flex gap-8 z-10">
                      <button onClick={() => roomAction('search')} className="bg-zinc-900 border border-zinc-700 px-8 py-4 hover:bg-zinc-800 hover:border-red-500 transition-all flex flex-col items-center gap-2 min-w-[120px]">
                          <Search /> 搜寻
                      </button>
                      <button onClick={() => setPhase(GamePhase.EXPLORATION)} className="bg-zinc-900 border border-zinc-700 px-8 py-4 hover:bg-zinc-800 hover:border-white transition-all flex flex-col items-center gap-2 min-w-[120px]">
                          <DoorOpen /> 离开
                      </button>
                  </div>
              </div>
          ) : (
             // Exploration View
             <div className="w-full h-full relative overflow-hidden" ref={viewportRef}>
                 {/* Moving Background */}
                 <div className="absolute inset-0 opacity-20" style={{ transform: `translateX(${-player.x * 0.2}px)`, backgroundImage: 'linear-gradient(90deg, #111 1px, transparent 1px)', backgroundSize: '100px 100%' }}></div>
                 
                 {/* Floor Info */}
                 <div className="absolute bottom-40 left-10 text-[10rem] font-bold text-[#110505] pointer-events-none select-none z-0">
                     {player.floor}
                 </div>

                 {/* Entities */}
                 {currentFloor.entities.map(entity => {
                     const dist = entity.x - player.x;
                     if (Math.abs(dist) > 800) return null;
                     return (
                         <div key={entity.id} className="absolute bottom-32 transition-transform duration-100 flex flex-col items-center" style={{ left: `calc(50% + ${dist}px)`, transform: 'translateX(-50%)' }}>
                             {entity.type === 'DOOR' && (
                                 <div className={`w-24 h-40 border-2 ${entity.data === RoomType.TOILET ? 'border-green-900 bg-green-900/10' : 'border-zinc-800 bg-zinc-900'} flex items-center justify-center relative`}>
                                     {Math.abs(dist) < 60 && <div className="absolute -top-10 text-xs text-white bg-black px-2 py-1">SPACE 进入</div>}
                                     <div className="text-zinc-600 font-bold vertical-text">{entity.data}</div>
                                 </div>
                             )}
                             {entity.type === 'ITEM' && (
                                 <div className={`w-8 h-8 bg-yellow-900 rounded-full flex items-center justify-center ${Math.abs(dist) < 60 ? 'animate-bounce' : ''}`}>
                                     <Briefcase size={14} className="text-yellow-500" />
                                 </div>
                             )}
                             {entity.type === 'NPC' && (
                                 <div className="w-12 h-32 bg-purple-900/20 border border-purple-500 flex items-center justify-center animate-pulse">
                                     <Ghost className="text-purple-400" />
                                 </div>
                             )}
                         </div>
                     );
                 })}

                 {/* Player */}
                 <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
                     <PlayerSprite facing={player.facing} />
                 </div>
             </div>
          )}
      </div>

      {/* Bottom Inventory/Log */}
      <div className="h-48 border-t border-[#300] bg-black flex text-sm">
          <div className="w-1/3 border-r border-[#300] p-4 overflow-y-auto">
              <h3 className="text-red-500 font-bold mb-2">日志</h3>
              <div className="space-y-1 font-mono text-xs text-zinc-500">
                  {logs.map(log => (
                      <div key={log.id} className={`${log.type === 'danger' ? 'text-red-400' : log.type === 'story' ? 'text-yellow-400' : ''}`}>
                          [{log.timestamp}] {log.text}
                      </div>
                  ))}
                  <div ref={logsEndRef} />
              </div>
          </div>
          <div className="w-2/3 p-4">
              <h3 className="text-zinc-400 font-bold mb-2">物品栏</h3>
              <div className="grid grid-cols-4 gap-2">
                  {player.inventory.map((item, idx) => (
                      <div key={idx} className="bg-zinc-900 border border-zinc-700 p-2 flex flex-col items-center justify-center hover:bg-zinc-800 cursor-pointer group relative"
                           onClick={() => useItem(item)}>
                          <div className="text-zinc-300 font-bold">{item.name}</div>
                          {item.type === 'FILE' && <FileText size={16} className="text-blue-500 mt-1" />}
                          {item.type === 'HEALING' && <Heart size={16} className="text-green-500 mt-1" />}
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 bg-black border border-white p-2 w-48 hidden group-hover:block z-50 text-xs">
                              {item.description}
                              {item.type === 'FILE' && <div className="text-blue-400 mt-1">[点击阅读]</div>}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}