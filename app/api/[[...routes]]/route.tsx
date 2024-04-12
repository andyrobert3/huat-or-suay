/** @jsxImportSource frog/jsx */
import 'dotenv';

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { fetchTokenPrice } from "@/app/utils/binance";
import { GameStatus, PositionType } from "@/app/utils/constants";
import { supabase } from '../../utils/supabase';
import { Tables } from "@/app/types/supabase";
import { WELCOME_GIF } from "@/app/constants";
import {PRICE_CACHE, pollPrices} from "@/app/utils/price";
import {countDownFrom, diffDuration, millisecondsToSeconds, timestamptzToMilliseconds} from "@/app/utils/time";

const TOKEN_TICKER = "ANGPAO";
const GAME_ROUND_IN_MS = 30_000;
const CRYPTO = "ETH";

pollPrices();

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame('/', (c) => {
    const { buttonValue, inputText, status } = c
    return c.res({
        image: WELCOME_GIF,
        intents: [
            <Button value="joinround" action="/pregame">👉 Begin</Button>,
            <Button value="profile" action="/profile">🧧 My profile</Button>,
            <Button value="instructions" action="/instructions">❓ Instructions</Button>,
        ]
    })
})

app.frame('/instructions', async (c) => {
    const { frameData } = c;
    return c.res({
        image: (
            <div
              style={{
                display: 'flex',
                padding: '30px',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundImage: 'linear-gradient(135deg,#202020,#000)',
                gap: '35px',
                fontSize:'22px',
                width: '1200px',
                height: '630px',
                color: '#fff',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems:'center'
              }}>
                <div style={{
                  display: 'flex',
                  color: '#fff',
                  fontSize: '60px'
                }}>
                  Instructions
                </div>
              </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: '100px',
                }}>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: '36px',
                      gap: '25px',
                  }}>
                    <div style={{
                        display: 'flex',
                    }}>
                        <p>
                            Each round lasts for 30 seconds, you’ll be betting on the price direction of Ethereum.
                            You have 1,000 🧧 {TOKEN_TICKER} to bet on the token going 📈 long or 📉 short by the end of the round.
                            At the end of each round, we check the prices and if goes in the direction you chose, you win back your 🧧 {TOKEN_TICKER}.
                            At the end of each day, the top user for that day wins 100 $DEGEN.
                        </p>
                    </div>
                  </div>
                </div>
            </div>
        ),
        intents: [
            <Button value="joinround" action="/pregame">👉 Begin</Button>,
        ],
    })
})

app.frame('/pregame', async (c) => {
    const tokenName = "Ethereum"
    const tokenSymbol = CRYPTO;

    const price = (await fetchTokenPrice(tokenSymbol)).toLocaleString(); // format w thousands sep

    // Get frame data
    const { frameData } = c
    const fid = frameData?.fid;

    const { data: user } = await supabase.from('User')
        .select()
        .eq('fid', fid)
        .single<Tables<'User'>>();

    const { data } = await supabase.from('Game')
        .select()
        .eq('status', GameStatus.IN_PROGRESS)
        .order('created_at', {ascending: false})
        .returns<Array<Tables<'Game'>>>();

    if (!fid) {
        return c.res({
            action: "/game",
            image: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDdqemlxOTBvMjE0a2VnczhvbzlxNXJzM2V3NnE0aWRrNnJ6ZDB5bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dYHFEFJEt4cYkOVkK3/giphy.gif",
            intents: [
                <Button value="joinround" action="/game">Join Round</Button>,
            ]
        });
    }

    return c.res({
        image: (
            <div
              style={{
                display: 'flex',
                padding: '30px',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundImage: 'linear-gradient(135deg,#202020,#000)',
                gap: '35px',
                fontSize:'22px',
                width: '1200px',
                height: '630px',
                color: '#fff',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems:'center'
              }}>
                <span
                  style={{
                    minHeight: '60px',
                    minWidth: '60px',
                    borderRadius: '10px',
                    backgroundImage: 'linear-gradient(135deg, #2e55ff, #ff279c)',
                    marginRight: '15px',
                  }}
                />
                <div style={{
                  display: 'flex',
                  color: '#fff',
                  fontSize: '60px'
                }}>
                  {tokenName} {tokenSymbol}
                </div>
              </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: '100px',
                }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      fontSize: '48px',
                      gap: '25px',
                  }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        color: '#7a7d89',
                        fontSize: '36px',
                      }}>Current price</div>
                      <div style={{
                        display: 'flex',
                      }}>${price}</div>
                    </div>
      
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        color: '#7a7d89',
                        fontSize: '36px',
                      }}>Your 🧧 {TOKEN_TICKER} balance</div>
                      <div style={{
                        display: 'flex',
                      }}>{user?.balance.toLocaleString()}</div>
                    </div>
                  </div>
      
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      fontSize: '48px',
                      gap: '25px',
                      fontWeight: '500',
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        color: '#7a7d89',
                        fontSize: '36px',
                      }}>Time now</div>
                      <div style={{
                        display: 'flex',
                      }}>{new Date().toTimeString().split(' ')[0]}</div>
                    </div>
                  </div>
                </div>
            </div>
        ),
        intents: [
            <TextInput placeholder={`Enter your position in 🧧 ${TOKEN_TICKER}`} />,
            <Button value="long" action="/game">📈 LONG</Button>,
            <Button value="short" action="/game">📉 SHORT</Button>,
            <Button action="/pregame">🔄 Refresh</Button>,
            <Button.Reset>🏠 Home</Button.Reset>,
        ],
    })
})

app.frame('/profile', async (c) => {
    const { status, frameData } = c
    const { fid } = frameData!;

    // If user doesn't exist, create user with default balance $1000

    // Read from "User" table
    const { data: user } = await supabase.from('User')
        .select()
        .eq('fid', fid)
        .single<Tables<'User'>>();

    // Number of wagered games
    const { data: games } = await supabase.from('Game')
        .select('fid')
        .eq('fid', fid)
        .returns<Array<Tables<'Game'>>>();

    return c.res({
        image: (
            <div
              style={{
                display: 'flex',
                padding: '30px',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundImage: 'linear-gradient(135deg,#202020,#000)',
                gap: '35px',
                fontSize:'22px',
                width: '1200px',
                height: '630px',
                color: '#fff',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems:'center'
              }}>
                <span
                  style={{
                    minHeight: '60px',
                    minWidth: '60px',
                    borderRadius: '10px',
                    backgroundImage: 'linear-gradient(135deg, #2e55ff, #ff279c)',
                    marginRight: '15px',
                  }}
                />
                <div style={{
                  display: 'flex',
                  color: '#fff',
                  fontSize: '60px'
                }}>
                  My profile
                </div>
              </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: '100px',
                }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      fontSize: '48px',
                      gap: '25px',
                  }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        color: '#7a7d89',
                        fontSize: '36px',
                      }}>FID</div>
                      <div style={{
                        display: 'flex',
                      }}>{fid}</div>
                    </div>
      
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        color: '#7a7d89',
                        fontSize: '36px',
                      }}>Your 🧧 {TOKEN_TICKER} balance</div>
                      <div style={{
                        display: 'flex',
                      }}>{user?.balance.toLocaleString()} 🧧</div>
                    </div>
                  </div>
      
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      fontSize: '48px',
                      gap: '25px',
                      fontWeight: '500',
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        color: '#7a7d89',
                        fontSize: '36px',
                      }}>Total games played</div>
                      <div style={{
                        display: 'flex',
                      }}>{games?.length ?? 0}</div>
                    </div>
                  </div>
                </div>
            </div>
        ),
        intents: [
            <Button action="/profile">🔄 Refresh</Button>,
            <Button.Reset>🏠 Home</Button.Reset>,
        ],
    })
})

app.frame('/game', async (c) => {
    const { buttonValue, inputText, status, frameData } = c
    const positionSize = Number(inputText);

    let positionType: PositionType | null = null;
    if (buttonValue !== 'refresh') {
        positionType = buttonValue as PositionType;
    }

    const { fid } = frameData!;
    // TODO: have validation on inputs

    // Reshare -> Idempotent (Read from DB, latest game for user assuming still playing)
    const { data } = await supabase.from('Game')
        .select()
        .eq('fid', fid)
        .eq('status', GameStatus.IN_PROGRESS)
        .order('created_at', { ascending: false })
        .returns<Array<Tables<'Game'>>>();

    let gameData = data;

    let timeFormat = "";

    // If no game found, create new game
    if (gameData == null || gameData?.length == 0) {
        // Query most recent game (to get "position" type)
        if (!positionType) {
            const { data: mostRecentGame } = await supabase.from('Game')
                .select()
                .eq('fid', fid)
                .order('created_at', { ascending: false })
                .single<Tables<'Game'>>();

            console.log({ mostRecentGame })
            positionType = mostRecentGame!.position as PositionType;

            // Read from DB (most recent game)
            gameData = [mostRecentGame!];

            timeFormat = '0';
        } else {
            const startPrice = await fetchTokenPrice(CRYPTO);
            const newGame = await supabase.from('Game').insert({
                status: GameStatus.IN_PROGRESS,
                wager: positionSize,
                position: positionType,
                fid,
                token: CRYPTO,
                startPrice,
                endPrice: null,
            }).select();

            const { data: user } = await supabase.from('User')
                .select('balance').eq('fid', fid).single<Tables<'User'>>();

            if (user === null) {
                throw new Error('User profile not fetch')
            }

            await supabase.from('User').update({
                balance: user.balance - positionSize,
            }).eq('fid', fid).select()

            timeFormat = '30';

            gameData = newGame.data;
        }

    } else {
        // Convert to Date object
        const gameDetails = gameData.filter(r => r.status === GameStatus.IN_PROGRESS)?.[0];

        const dateFromTimestamptz = timestamptzToMilliseconds(gameDetails.gameStartTimeStamp);
        // Get current date
        const currentDate = Date.now();

        // Calculate difference in milliseconds
        const durationInMs = diffDuration(currentDate, dateFromTimestamptz);
        const durationLeft = countDownFrom(durationInMs, GAME_ROUND_IN_MS);

        // For simplicity sake, if d == 0, we will udpate the end time. This is not to be used in PROD.
        if (durationLeft <= 0) {
            // Update game end time
            const gameOutcome: GameStatus = determineOutcome(gameDetails.position as PositionType, gameDetails.startPrice, PRICE_CACHE[CRYPTO]);

            try {
                await supabase.from('Game').update({
                    status: gameOutcome,
                    endPrice: PRICE_CACHE[CRYPTO],
                }).eq('id', gameDetails.id).select();

                if (gameOutcome === GameStatus.WON) {
                    const userBalance = await supabase.from('User')
                        .select('balance').eq('fid', fid).single<Tables<'User'>>();
                    if (userBalance.data === null) {
                        throw new Error('User profile not fetch')
                    }

                    await supabase.from('User').update({
                        balance:  userBalance.data.balance + (2 * positionSize),
                    }).eq('fid', fid).select()
                }
            } catch (e) {
                console.error(e);
            }
        }
        timeFormat = millisecondsToSeconds(durationLeft);
    }

    return c.res({
        image: (
            <div
                style={{
                    display: 'flex',
                    padding: '30px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundImage: 'linear-gradient(135deg,#202020,#000)',
                    gap: '35px',
                    fontSize:'22px',
                    width: '1200px',
                    height: '630px',
                    color: '#fff',
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems:'center'
                }}>
                <span
                    style={{
                        minHeight: '60px',
                        minWidth: '60px',
                        borderRadius: '10px',
                        backgroundImage: 'linear-gradient(135deg, #2e55ff, #ff279c)',
                        marginRight: '15px',
                    }}
                />
                    <div style={{
                        display: 'flex',
                        color: '#fff',
                        fontSize: '60px'
                    }}>
                        Your bet on {gameData?.[0]?.token}
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: '100px',
                }}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            fontSize: '48px',
                            gap: '25px',
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}>
                            <div style={{
                                display: 'flex',
                                color: '#7a7d89',
                                fontSize: '36px',
                            }}>Your 🧧 {TOKEN_TICKER} bet placed</div>
                            <div style={{
                                display: 'flex',
                            }}>{gameData?.[0]?.wager}</div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}>
                            <div style={{
                                display: 'flex',
                                color: '#7a7d89',
                                fontSize: '36px',
                            }}>You bet on</div>
                            <div style={{
                                display: 'flex',
                            }}>{gameData?.[0]?.position.toUpperCase()} {gameData?.[0]?.token}</div>
                        </div>
                    </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      fontSize: '48px',
                      gap: '25px',
                      fontWeight: '500',
                    }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        color: '#7a7d89',
                        fontSize: '36px',
                      }}>Price of {gameData?.[0]?.token} at bet time
                      </div>
                      <div style={{
                        display: 'flex',
                      }}>${gameData?.[0]?.startPrice.toLocaleString()}</div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        color: '#7a7d89',
                        fontSize: '36px',
                      }}>Price of {gameData?.[0]?.token} now
                      </div>
                      <div style={{
                        display: 'flex',
                      }}>${PRICE_CACHE['ETH'].toLocaleString()}</div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        color: '#7a7d89',
                        fontSize: '36px',
                      }}>Countdown
                      </div>
                      <div style={{
                        display: 'flex',
                      }}>{timeFormat}</div>
                    </div>
                  </div>
                </div>
            </div>
        ),
      intents: [
        <Button action="/game" value="refresh">🔄 Refresh</Button>,
        <Button action="/result" value="result">💯 Check Result</Button>,
        <Button.Reset>🏠 Home</Button.Reset>,
      ],
    })
})

app.frame('/result', async(c) => {
    const { frameData } = c
    const { fid } = frameData!;

    const { data: gameData, error } = await supabase.from('Game')
        .select()
        .eq('fid', fid)
        .order('created_at', { ascending: false })
        .returns<Array<Tables<'Game'>>>();

    if (gameData === null) {
        throw new Error("Data is null")
    }
    const gameDetails = gameData.filter(r => r.status !== GameStatus.IN_PROGRESS)[0];
    const userDetails = await supabase.from('User').select('balance').eq('fid', fid).single<Tables<'User'>>();

    if (userDetails.data === null) {
        throw new Error('User profile not fetch')
    }

    return c.res({
        image: (
            <div
                style={{
                    display: 'flex',
                    padding: '30px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundImage: 'linear-gradient(135deg,#202020,#000)',
                    gap: '35px',
                    fontSize:'22px',
                    width: '1200px',
                    height: '630px',
                    color: '#fff',
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems:'center'
                }}>
                <span
                    style={{
                        minHeight: '60px',
                        minWidth: '60px',
                        borderRadius: '10px',
                        backgroundImage: 'linear-gradient(135deg, #2e55ff, #ff279c)',
                        marginRight: '15px',
                    }}
                />
                    <div style={{
                        display: 'flex',
                        color: '#fff',
                        fontSize: '60px'
                    }}>
                        {gameDetails.status === GameStatus.WON ? `HUAT LAH! You won ${gameDetails.wager}` : `SIBEI SUAY! You lost ${gameDetails.wager}`} 
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: '100px',
                }}>
                    
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            fontSize: '48px',
                            gap: '25px',
                        }}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}>
                            <div style={{
                                display: 'flex',
                                color: '#7a7d89',
                                fontSize: '36px',
                            }}>Price of {gameData?.[0]?.token} at bet time</div>
                            <div style={{
                                display: 'flex',
                            }}>{gameDetails.startPrice}</div>
                        </div>


                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}>
                            <div style={{
                                display: 'flex',
                                color: '#7a7d89',
                                fontSize: '36px',
                            }}>Final price of {gameData?.[0]?.token}</div>
                            <div style={{
                                display: 'flex',
                            }}>{gameDetails.endPrice}</div>
                        </div>
                    </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      fontSize: '48px',
                      gap: '25px',
                      fontWeight: '500',
                    }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        color: '#7a7d89',
                        fontSize: '36px',
                      }}>You bet on
                      </div>
                      <div style={{
                        display: 'flex',
                      }}>{gameDetails.position} {gameDetails.token}</div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        color: '#7a7d89',
                        fontSize: '36px',
                      }}>Your new 🧧 {TOKEN_TICKER} balance
                      </div>
                      <div style={{
                        display: 'flex',
                      }}>{userDetails.data.balance}</div>
                    </div>
                  </div>
                </div>
            </div>
        ),
        intents: [
            <Button action="/">Play Again</Button>,
            <Button.Reset>Reset</Button.Reset>,
        ],
    })
});

function determineOutcome(position: PositionType, startPrice: number, currentPrice: number): GameStatus {
  if (position.toUpperCase() === PositionType.LONG) {
    return currentPrice > startPrice ? GameStatus.WON : GameStatus.LOST;
  } else {
    return currentPrice < startPrice ? GameStatus.WON : GameStatus.LOST;
  }
}


devtools(app, {serveStatic})

export const GET = handle(app)
export const POST = handle(app)
