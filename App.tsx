import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, RoomType, PlayerState, LogEntry, Item, FloorData, DialogData, Entity, Achievement, NPC } from './types';
import { FLOORS, ITEMS_DB, INITIAL_TIME_MINUTES, DEADLINE_MINUTES, RUMOR_TEXTS, ACHIEVEMENTS_DB, NPC_DB } from './constants';
import { audio } from './services/audioService';
import { 
  Heart, Clock, Search, DoorOpen, Briefcase, FileText, Lock, Box,
  Volume2, VolumeX, ShoppingCart, Award, AlertTriangle, FileWarning, 
  ArrowUp, ArrowDown, MessageCircle, User, Zap, ChevronUp, ChevronDown
} from 'lucide-react';

// --- Components ---

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 5000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden z-[100] cursor-none select-none">
            <div className="flex flex-col items-center animate-fade-in duration-1000">
                <h1 className="text-5xl md:text-8xl font-serif font-black text-[#8a1c1c] tracking-tighter drop-shadow-2xl mb-4">
                    诡异医院<span className="text-3xl md:text-5xl align-top ml-4 text-[#5a0c0c] font-light">: 5点钟声</span>
                </h1>
                <h2 className="text-sm md:text-xl font-serif text-[#444] tracking-[0.8em] uppercase font-light mt-6">
                    The-Hospital-At-Five
                </h2>
            </div>
            <div className="absolute bottom-12 text-[10px] md:text-xs text-[#333] tracking-widest font-mono opacity-60">
                游戏内有文字以及图片恐怖元素，无冲击性画面，请谨慎游玩。
            </div>
        </div>
    );
};

const AchievementPopup = ({ achievement }: { achievement: Achievement }) => (
    <div className="fixed top-24 right-4 z-[200] animate-slide-in-right glass-panel border-l-4 border-yellow-500 p-4 w-64">
        <div className="flex items-center gap-2 text-yellow-500 mb-1">
            <Award size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">解锁成就</span>
        </div>
        <div className="text-white font-serif font-bold">{achievement.title}</div>
        <div className="text-xs text-zinc-400 mt-1">{achievement.description}</div>
        <div className="text-xs text-yellow-600 mt-2 font-mono">+ {achievement.rewardGold} GOLD</div>
    </div>
);

const CinematicIntro = ({ onComplete }: { onComplete: () => void }) => {
    const [page, setPage] = useState(0);
    const pages = [
        <div className="space-y-8 text-center max-w-3xl">
            <h1 className="text-3xl text-red-900 font-serif font-black tracking-widest mb-8">下午五点的钟声</h1>
            <div className="space-y-4 text-lg text-zinc-300 font-serif leading-loose text-left border-l-2 border-red-900/30 pl-8">
                <p>当下午五点的钟声响起，医院的规则将会改变——而你，已经错过了剩下的时间。</p>
                <p>你记得自己是来看病的。</p>
                <p>妈妈接了个电话，说马上回来。</p>
                <p>然后门锁上了。</p>
                <p>柜台上出现了一张不属于这里的纸条：</p>
                <p className="text-red-500 italic">“欢迎来到诡异医院。请在下午5点前找到厕所并进入。”</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-600 font-mono mt-8 text-left pl-8">
                <div>- 一把生锈的手枪</div>
                <div>- 一个硬面包</div>
                <div>- 一瓶浑浊的水</div>
                <div>- 一个永远指向4:30的时钟</div>
            </div>
        </div>,
        <div className="space-y-8 text-center max-w-3xl font-serif text-left">
            <h1 className="text-3xl text-zinc-100 font-bold mb-8 text-center">你将面临什么</h1>
            <div className="space-y-2">
                <h3 className="text-xl text-red-800 font-bold">时间，是你的第一个敌人</h3>
                <p className="text-zinc-500 text-sm">每60秒，医院时间前进1分钟。下午5点是分界线——之前是医院，之后是地狱。</p>
            </div>
             <div className="space-y-2 mt-6">
                <h3 className="text-xl text-red-800 font-bold">医生，不再是救你的人</h3>
                <p className="text-zinc-500 text-sm">他们穿着白大褂，但口罩下没有脸。走廊里回荡着他们的脚步声。</p>
            </div>
        </div>,
        <div className="space-y-12 text-center max-w-3xl">
            <h1 className="text-3xl text-white font-serif tracking-widest">最后的问题</h1>
            <div className="space-y-6 text-xl text-zinc-400 font-serif leading-loose">
                <p>当5点的钟声响起，敲门声响起时，你下午会开门吗？</p>
                <p>当你发现医院的真相与你的记忆不符时，你会相信哪个？</p>
            </div>
            <div className="mt-12 p-8 border border-zinc-800 bg-black/80">
                <div className="text-2xl text-red-600 mb-6 font-bold tracking-[0.5em]">游戏现在开始</div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-left font-mono text-zinc-500 text-sm w-fit mx-auto">
                    <div>时间：4:31</div>
                    <div>生命值：5/5</div>
                </div>
            </div>
        </div>
    ];

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 cursor-pointer transition-colors duration-1000" onClick={() => {
            if (page < pages.length - 1) setPage(p => p + 1);
            else onComplete();
            audio.playBeep(150, 'sine', 0.05);
        }}>
            <div className="vhs-noise"></div>
            <div className="scanline"></div>
            <div className="cinema-fade-in w-full flex justify-center">{pages[page]}</div>
            <div className="absolute bottom-10 text-zinc-800 text-xs tracking-[0.3em] animate-pulse">[ 点击继续 ]</div>
        </div>
    );
};

const Keypad = ({ target, onClose, onSuccess }: { target: Entity, onClose: () => void, onSuccess: () => void }) => {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'ERROR' | 'SUCCESS'>('IDLE');

    const handlePress = (char: string) => {
        if (status !== 'IDLE') return;
        if (char === 'CLR') {
            setInput('');
        } else if (char === 'ENT') {
            if (input === target.code) {
                setStatus('SUCCESS');
                audio.playBeep(800, 'sine', 0.1);
                setTimeout(onSuccess, 1000);
            } else {
                setStatus('ERROR');
                audio.playBeep(100, 'sawtooth', 0.5);
                setTimeout(() => {
                    setInput('');
                    setStatus('IDLE');
                }, 1000);
            }
        } else {
            if (input.length < 4) {
                setInput(prev => prev + char);
                audio.playBeep(400, 'sine', 0.05);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150]">
             <div className="glass-panel p-8 w-80">
                 <div className={`mb-6 p-4 bg-black font-mono text-3xl text-center border font-hud
                     ${status === 'ERROR' ? 'border-red-900 text-red-500' : 
                       status === 'SUCCESS' ? 'border-green-900 text-green-500' : 'border-zinc-800 text-green-500'}`}>
                     {status === 'ERROR' ? 'ERR' : status === 'SUCCESS' ? 'OPEN' : input.padEnd(4, '_')}
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                     {[1,2,3,4,5,6,7,8,9].map(n => (
                         <button key={n} onClick={() => handlePress(n.toString())} className="glass-btn p-4 text-zinc-300 text-xl font-hud">{n}</button>
                     ))}
                     <button onClick={() => handlePress('CLR')} className="glass-btn p-4 text-red-500 font-bold">C</button>
                     <button onClick={() => handlePress('0')} className="glass-btn p-4 text-zinc-300 text-xl font-hud">0</button>
                     <button onClick={() => handlePress('ENT')} className="glass-btn p-4 text-green-500 font-bold">E</button>
                 </div>
                 <button onClick={onClose} className="mt-6 w-full text-zinc-600 hover:text-zinc-400 text-sm tracking-widest uppercase">ABORT</button>
             </div>
        </div>
    );
};

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.SPLASH);
  const [isMuted, setIsMuted] = useState(false);
  const [player, setPlayer] = useState<PlayerState>({
    hp: 5, maxHp: 5, sanity: 100, gold: 10, floor: 1,
    z: 0, // Using Z for depth
    facing: 'forward',
    inventory: [
      { ...ITEMS_DB['gun'], quantity: 1 },
      { ...ITEMS_DB['bread'], quantity: 1 },
      { ...ITEMS_DB['water'], quantity: 1 },
      { ...ITEMS_DB['clock'], quantity: 1 }
    ],
    weaponLevel: 1, pets: [], toiletLevel: 0,
    time: INITIAL_TIME_MINUTES, flags: {}, achievements: [], lastCombatTime: 0
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeRoom, setActiveRoom] = useState<RoomType | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<Item | null>(null); 
  const [activeContainer, setActiveContainer] = useState<Entity | null>(null);
  const [dialogData, setDialogData] = useState<DialogData | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const currentFloor = FLOORS.find(f => f.level === player.floor) || FLOORS[0];
  
  // Find nearest interactive entity in Z-space
  const nearestEntity = currentFloor.entities.find(e => Math.abs(e.z - player.z) < 150);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  // Achievement Loop
  useEffect(() => {
    const checkAchievements = () => {
        ACHIEVEMENTS_DB.forEach(ach => {
            if (player.achievements.includes(ach.id)) return;
            let unlocked = false;
            if (ach.id === 'first_gold' && player.gold >= 100) unlocked = true;
            if (ach.id === 'survivor_10' && player.time >= INITIAL_TIME_MINUTES + 10) unlocked = true;
            if (ach.id === 'scholar' && player.inventory.filter(i => i.type === 'FILE').length >= 3) unlocked = true;
            if (ach.id === 'high_climber' && player.floor >= 10) unlocked = true;
            if (unlocked) {
                setPlayer(p => ({ ...p, achievements: [...p.achievements, ach.id], gold: p.gold + ach.rewardGold }));
                setNewAchievement(ach);
                addLog(`获得成就：${ach.title} (+${ach.rewardGold} G)`, "gold");
                audio.playBeep(1000, 'sine', 0.2);
                setTimeout(() => setNewAchievement(null), 4000);
            }
        });
    };
    const interval = setInterval(checkAchievements, 2000);
    return () => clearInterval(interval);
  }, [player]);

  useEffect(() => {
    if ((phase === GamePhase.EXPLORATION || phase === GamePhase.ROOM_VIEW) && player.time >= DEADLINE_MINUTES) {
        setPhase(GamePhase.GAME_OVER);
        audio.stopECG();
        addLog("时间到了。17:30。黑暗彻底降临。", "danger");
    }
  }, [player.time, phase]);

  const toggleMute = () => setIsMuted(audio.toggleMute());
  
  const addLog = useCallback((text: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev.slice(-20), {
      id: Math.random().toString(36).substr(2, 9), text, type,
      timestamp: `${Math.floor(player.time/60)}:${(player.time%60).toString().padStart(2,'0')}`
    }]);
  }, [player.time]);

  const advanceTime = (mins: number) => setPlayer(p => ({ ...p, time: p.time + mins }));
  
  const performTransition = async (callback: () => void) => {
      setIsTransitioning(true); audio.playWind();
      await new Promise(r => setTimeout(r, 500));
      callback();
      await new Promise(r => setTimeout(r, 500));
      setIsTransitioning(false);
  };

  const interact = () => {
    if (!nearestEntity) return;
    const e = nearestEntity;
    if (e.type === 'DOOR') enterRoom(e.data as RoomType);
    else if (e.type === 'ITEM') collectItem(e.data as string);
    else if (e.type === 'NPC') startDialog(e.data);
    else if (e.type === 'CONTAINER') handleContainer(e);
  };

  const startDialog = (npcId: string) => {
      const npc = NPC_DB[npcId];
      if (!npc) return;
      const node = npc.dialogue[0];
      updateDialog(npc, node);
      setPhase(GamePhase.DIALOG);
  };

  const updateDialog = (npc: NPC, node: any) => {
      setDialogData({
          speaker: npc.name,
          text: node.text,
          options: node.options.map((opt: any) => ({
              text: opt.text,
              action: () => {
                  if (opt.action === 'clue_light') addLog("线索：医生怕光。", "info");
                  if (opt.nextId) {
                      const next = npc.dialogue.find(n => n.id === opt.nextId);
                      if (next) updateDialog(npc, next);
                      else setPhase(GamePhase.EXPLORATION);
                  } else {
                      setPhase(GamePhase.EXPLORATION);
                  }
              }
          }))
      });
  };

  const collectItem = (id: string) => {
      if (id === 'rumor_note') {
          const rumor = RUMOR_TEXTS[Math.floor(Math.random() * RUMOR_TEXTS.length)];
          const item = { ...ITEMS_DB['rumor_note'], quantity: 1, content: rumor.text, isTrue: rumor.isTrue };
          setPlayer(p => ({ ...p, inventory: [...p.inventory, item as Item] }));
          setActivePuzzle(item as Item); setPhase(GamePhase.PUZZLE);
      } else {
          const item = ITEMS_DB[id];
          if (item) {
              setPlayer(p => ({ ...p, inventory: [...p.inventory, { ...item, quantity: 1 }] }));
              addLog(`获得物品: ${item.name}`, "success");
              audio.playBeep(800, 'sine', 0.1);
          }
      }
  };

  const handleContainer = (e: Entity) => {
      if (e.interacted) return addLog("空了。", "info");
      if (e.locked) { setActiveContainer(e); setPhase(GamePhase.KEYPAD); }
  };

  const handleContainerUnlock = () => {
      if (!activeContainer || !activeContainer.contentId) return;
      const item = ITEMS_DB[activeContainer.contentId];
      setPlayer(p => ({ ...p, inventory: [...p.inventory, { ...item, quantity: 1 }] }));
      addLog(`打开了！获得 ${item.name}`, "success");
      activeContainer.interacted = true; activeContainer.locked = false;
      setActiveContainer(null); setPhase(GamePhase.EXPLORATION);
  };

  const enterRoom = (room: RoomType) => {
    audio.playBeep(100, 'square', 0.2);
    performTransition(() => {
        advanceTime(1);
        if (room === RoomType.ELEVATOR) {
            setPlayer(p => ({ ...p, floor: p.floor + 1, z: 0 }));
            addLog(`进入第 ${player.floor + 1} 层...`, "system");
        } else if (room === RoomType.SHOP) {
            setActiveRoom(room); setPhase(GamePhase.SHOP_VIEW);
        } else {
            setActiveRoom(room); setPhase(GamePhase.ROOM_VIEW);
            if (room === RoomType.TOILET && Math.random() > 0.7) { /* Simplified toilet event */ }
        }
    });
  };

  // Keyboard Navigation (Z-axis)
  useEffect(() => {
    if (phase !== GamePhase.EXPLORATION) return;
    const handleKey = (e: KeyboardEvent) => {
        const step = 50;
        if (e.key === 'ArrowUp' || e.key === 'w') setPlayer(p => ({ ...p, z: Math.min(currentFloor.length, p.z + step) }));
        if (e.key === 'ArrowDown' || e.key === 's') setPlayer(p => ({ ...p, z: Math.max(0, p.z - step) }));
        if (e.key === ' ' || e.key === 'Enter') interact();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, player.z, currentFloor]);

  // UI Handlers for Mouse
  const moveForward = () => setPlayer(p => ({ ...p, z: Math.min(currentFloor.length, p.z + 50) }));
  const moveBack = () => setPlayer(p => ({ ...p, z: Math.max(0, p.z - 50) }));

  if (phase === GamePhase.SPLASH) return <SplashScreen onComplete={() => setPhase(GamePhase.MENU)} />;
  if (phase === GamePhase.INTRO) return <CinematicIntro onComplete={() => setPhase(GamePhase.EXPLORATION)} />;
  if (phase === GamePhase.MENU) return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative z-[50]">
        <div className="flashlight-overlay"></div>
        <h1 className="text-6xl text-[#4a0a0a] font-serif tracking-[0.2em] font-bold drop-shadow-lg mb-8">诡异医院</h1>
        <button onClick={() => { audio.init(); audio.resume(); setPhase(GamePhase.INTRO); }} className="glass-btn px-12 py-4 text-zinc-400 text-lg tracking-[0.5em] uppercase">[ 开始游戏 ]</button>
      </div>
  );

  return (
    <div className="h-screen w-full bg-black text-zinc-300 flex flex-col font-serif overflow-hidden select-none">
      <button onClick={toggleMute} className="absolute top-4 right-4 z-[150] w-10 h-10 rounded-full glass-panel flex items-center justify-center">{isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
      {newAchievement && <AchievementPopup achievement={newAchievement} />}
      <div className={`transition-screen ${isTransitioning ? 'active' : ''}`}></div>
      <div className="flashlight-overlay"></div>

      {/* Modern Weird HUD */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-30 pointer-events-none">
          <div className="flex flex-col gap-1">
              <div className="text-4xl text-red-600 font-black font-hud tracking-tighter">{player.floor.toString().padStart(2,'0')}F</div>
              <div className="text-xs text-zinc-500 uppercase tracking-[0.3em]">{currentFloor.name}</div>
              <div className="text-[10px] text-red-900/80 animate-pulse mt-1">{currentFloor.dangerTitle}</div>
          </div>
          <div className="flex gap-6 font-hud text-xl">
             <div className="flex items-center gap-2 text-red-500"><Heart className="fill-current w-4 h-4"/> {player.hp}</div>
             <div className="flex items-center gap-2 text-yellow-500"><Clock className="w-4 h-4"/> {Math.floor(player.time/60)}:{(player.time%60).toString().padStart(2,'0')}</div>
             <div className="flex items-center gap-2 text-amber-600"><span className="text-xs">$</span>{player.gold}</div>
          </div>
      </div>

      {/* 3D Viewport */}
      {phase === GamePhase.EXPLORATION && (
          <div className="absolute inset-0 z-0 overflow-hidden perspective-container" style={{ perspective: '800px' }}>
             {/* Floor/Ceiling Grids */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] z-10 pointer-events-none"></div>
             
             {/* 3D World Transform */}
             <div className="w-full h-full preserve-3d transition-transform duration-300 ease-out" style={{ transformStyle: 'preserve-3d' }}>
                 
                 {/* Entities */}
                 {currentFloor.entities.map(e => {
                     const relZ = e.z - player.z;
                     if (relZ < 0 || relZ > 1500) return null; // Clipping

                     // 3D Positioning Logic
                     // Scale factor makes objects smaller as they move away (reverse of distance)
                     // But here, objects at player.z are close (scale 1). Objects at player.z + 1000 are far.
                     const scale = 1000 / (1000 + relZ);
                     const opacity = Math.max(0.1, 1 - (relZ / 1200));
                     
                     // Side placement
                     let xOffset = '0%';
                     if (e.side === 'left') xOffset = '-40%';
                     else if (e.side === 'right') xOffset = '40%';
                     
                     return (
                         <div key={e.id} className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center transition-all duration-300"
                              style={{ 
                                  transform: `translate3d(-50%, -50%, 0) translate(${xOffset}, 10%) scale(${scale})`,
                                  opacity,
                                  zIndex: 1500 - relZ 
                              }}>
                              
                              {/* Visual Representation */}
                              {e.type === 'DOOR' && (
                                  <div className={`w-40 h-64 border-4 ${e.data === RoomType.TOILET ? 'border-green-800 bg-green-900/20' : 'border-zinc-800 bg-zinc-900/90'} flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.8)]`}>
                                      <div className="text-zinc-500 font-bold writing-mode-vertical text-2xl drop-shadow-md">{e.data}</div>
                                  </div>
                              )}
                              {e.type === 'ITEM' && (
                                  <div className="w-12 h-12 bg-yellow-900/20 border border-yellow-700/50 rounded-full flex items-center justify-center animate-bounce">
                                      <Box className="text-yellow-500" />
                                  </div>
                              )}
                              {e.type === 'NPC' && (
                                  <div className="w-20 h-48 bg-black/50 border-b-4 border-zinc-500 flex items-center justify-center relative">
                                      <User className="w-12 h-12 text-zinc-400" />
                                      <div className="absolute -top-6 text-[10px] bg-zinc-900 px-2 py-1">NPC</div>
                                  </div>
                              )}
                              {e.type === 'CONTAINER' && (
                                  <div className={`w-24 h-24 bg-zinc-900 border-2 ${e.locked ? 'border-red-800' : 'border-green-800'} flex items-center justify-center`}>
                                      {e.locked ? <Lock className="text-red-500"/> : <Box className="text-green-500"/>}
                                  </div>
                              )}
                              
                              {/* Interaction Hint (Only when close) */}
                              {relZ < 150 && (
                                  <div className="absolute -top-12 bg-white/10 backdrop-blur px-2 py-1 text-[10px] uppercase tracking-widest text-white animate-pulse whitespace-nowrap">
                                      [ E ] {e.type}
                                  </div>
                              )}
                         </div>
                     );
                 })}
             </div>

             {/* Dynamic Chat Button if NPC near */}
             {nearestEntity?.type === 'NPC' && (
                 <button onClick={interact} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 glass-btn p-4 rounded-full animate-ping-slow flex items-center gap-2">
                     <MessageCircle /> <span className="text-xs font-bold">交谈</span>
                 </button>
             )}
          </div>
      )}

      {/* Control Panel (Modern Weird) */}
      {phase === GamePhase.EXPLORATION && (
        <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-2 items-center pointer-events-auto">
            <button onMouseDown={moveForward} className="w-16 h-16 glass-panel flex items-center justify-center active:bg-red-900/50 transition-colors border-zinc-600">
                <ChevronUp size={24}/>
            </button>
            <button onMouseDown={moveBack} className="w-16 h-16 glass-panel flex items-center justify-center active:bg-red-900/50 transition-colors border-zinc-600">
                <ChevronDown size={24}/>
            </button>
            <div className="text-[9px] text-zinc-600 font-mono tracking-widest mt-1">MOVE (Z-AXIS)</div>
        </div>
      )}
      
      {/* Interaction Button for Mobile/Mouse */}
      {nearestEntity && phase === GamePhase.EXPLORATION && (
          <button onClick={interact} className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 glass-btn px-8 py-3 text-sm tracking-[0.3em] font-bold border-red-900/50 text-red-100 hover:bg-red-900/20">
              INTERACT
          </button>
      )}

      {/* Overlays (Puzzle, Keypad, Dialog, Room, Shop) */}
      {phase === GamePhase.PUZZLE && activePuzzle && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-8">
              <div className="bg-[#dcd0b0] text-black p-8 max-w-md shadow-2xl rotate-1">
                  <h2 className="text-xl font-black mb-4 uppercase border-b-2 border-black pb-2">{activePuzzle.name}</h2>
                  <p className="font-serif leading-relaxed whitespace-pre-wrap">{activePuzzle.content}</p>
                  <button onClick={() => setPhase(GamePhase.EXPLORATION)} className="mt-8 w-full border border-black py-2 hover:bg-black hover:text-white transition-colors">CLOSE</button>
              </div>
          </div>
      )}
      {phase === GamePhase.KEYPAD && activeContainer && <Keypad target={activeContainer} onClose={() => setPhase(GamePhase.EXPLORATION)} onSuccess={handleContainerUnlock} />}
      {phase === GamePhase.DIALOG && dialogData && (
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/90 to-transparent z-50 flex items-end justify-center pb-12">
              <div className="w-full max-w-3xl px-8">
                  <div className="text-red-500 font-bold tracking-widest mb-2 text-sm uppercase">{dialogData.speaker}</div>
                  <div className="text-2xl text-zinc-100 font-serif mb-6 drop-shadow-md">{dialogData.text}</div>
                  <div className="flex gap-4">
                      {dialogData.options.map((opt, i) => (
                          <button key={i} onClick={opt.action} className="glass-btn px-6 py-3 text-sm hover:bg-white/10 border-white/20">{opt.text}</button>
                      ))}
                  </div>
              </div>
          </div>
      )}
      {phase === GamePhase.SHOP_VIEW && activeRoom === RoomType.SHOP && (
          <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center">
              <div className="glass-panel w-full max-w-4xl h-3/4 flex flex-col p-6">
                  <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                      <h2 className="text-2xl text-amber-600 font-serif flex items-center gap-2"><ShoppingCart/> 诡异商店</h2>
                      <button onClick={() => setPhase(GamePhase.EXPLORATION)} className="text-zinc-400 hover:text-white">CLOSE</button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 overflow-y-auto">
                      {['medkit', 'bandage', 'bread', 'gun'].map(id => {
                          const item = ITEMS_DB[id];
                          return (
                              <div key={id} className="border border-white/10 p-4 hover:bg-white/5 cursor-pointer" onClick={() => {
                                  if (player.gold >= item.value*5) {
                                      setPlayer(p => ({...p, gold: p.gold - item.value*5, inventory: [...p.inventory, {...item, quantity: 1}]}));
                                      addLog("已购买", "gold");
                                  }
                              }}>
                                  <div className="font-bold">{item.name}</div>
                                  <div className="text-amber-500 text-xs mt-1">{item.value * 5} G</div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}
      {phase === GamePhase.ROOM_VIEW && (
           <div className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center">
               <h2 className="text-6xl text-red-800 font-black tracking-widest mb-4">{activeRoom}</h2>
               <div className="flex gap-4">
                   <button onClick={() => { advanceTime(5); addLog("什么也没找到。", "info"); }} className="glass-btn px-8 py-3">搜寻</button>
                   <button onClick={() => performTransition(() => setPhase(GamePhase.EXPLORATION))} className="glass-btn px-8 py-3">离开</button>
               </div>
           </div>
      )}

      {/* Inventory Bar (Bottom) */}
      <div className="absolute bottom-0 left-0 p-6 z-30 pointer-events-auto">
          <div className="flex gap-2">
              {player.inventory.map((item, i) => (
                  <div key={i} className="w-10 h-10 glass-panel flex items-center justify-center cursor-pointer hover:border-red-500/50"
                       onClick={() => { if(item.type === 'FILE' || item.type === 'RUMOR') { setActivePuzzle(item); setPhase(GamePhase.PUZZLE); }}}>
                      {item.type === 'FILE' ? <FileText size={16} className="text-zinc-400"/> : <Box size={16} className="text-zinc-600"/>}
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
}