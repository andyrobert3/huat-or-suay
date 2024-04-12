/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { fetchTokenPrice } from "@/app/utils/binance";
import { GameStatus, PositionType } from "@/app/utils/constants";
import { supabase } from '../../utils/supabase';
import { Tables } from "@/app/types/supabase";
import { WELCOME_GIF } from "@/app/constants";

const TOKEN_TICKER = "HUAT";

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
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
                            Each round lasts for 30 seconds, you’ll be presented with a random token to bet on.
                            You have 100 🧧 {TOKEN_TICKER} to bet on the token going 📈 up or 📉 down by the end of the round.
                            At the end of each round, we check the prices and if goes in the direction you chose, you win 1.5X.
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
    const tokenSymbol = "ETH"

    // Fetch prices of token
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
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      <div style={{
                        display: 'flex',
                        color: '#7a7d89',
                        fontSize: '36px',
                      }}>Ends in</div>
                      <div style={{
                        display: 'flex',
                      }}>{data[0]?.gameEndTimeStamp}</div>
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
            <Button.Reset>🗑️ Reset</Button.Reset>,
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
            <Button.Reset>Reset</Button.Reset>,
        ],
    })
})

app.frame('/game', async (c) => {
    const { buttonValue, inputText, status, frameData } = c
    const positionSize = Number(inputText);
    const positionType = buttonValue as PositionType;
    const { fid } = frameData;
    // TODO: have validation on inputs

    // Reshare -> Idempotent (Read from DB, latest game for user assuming still playing)
    const {data} = await supabase.from('Game')
        .select()
        .eq('fid', fid)
        .eq('status', GameStatus.IN_PROGRESS)
        .order('created_at', {ascending: false})
        .returns<Array<Tables<'Game'>>>();

    // string to number

    console.log("data", data);
    let timeFormat = "";
    // If no game found, create new game
    if (data?.length == 0) {
        // Insert "Game" record
        // Store timestamp
        const res = await supabase.from('Game').upsert({
            status: GameStatus.IN_PROGRESS,
            wager: positionSize,
            position: positionType,
            fid: fid,
            token: "ETH",
            startPrice: await fetchTokenPrice("ETH"),
            endPrice: null,
        }).select();

        console.log('Data:', res.data);
        console.log('Error:', res.error);

        // Store price at start time

        // Insert "Game" record
    } else {
        // If game found, update frame data
        // Return current price

        // Check if game is still in progress
        // If hit deadline, end game

        // always take first game
        // if (data === null) {
        //   throw new Error("Data is null")
        // }
        // const adjustedTimestamp = data[0].gameEndTimeStamp.replace(' ', 'T') + 'Z';
        //
        // // Convert to Date object
        // const dateFromTimestamptz = new Date(adjustedTimestamp);
        //
        // // Get current date
        // const currentDate = new Date();
        //
        // // Calculate difference in milliseconds
        // const differenceInMilliseconds = currentDate.getMilliseconds() - dateFromTimestamptz.getMilliseconds();
        //
        // console.log('current', currentDate.getMilliseconds());
        // console.log('end', dateFromTimestamptz.getMilliseconds());
        // console.log('adjustedTimestamp', adjustedTimestamp);
        // console.log('diff', differenceInMilliseconds);
        // Convert milliseconds to minutes and seconds
        // const differenceInMinutes = Math.floor(differenceInMilliseconds / 60000);
        // const differenceInSeconds = Math.floor((differenceInMilliseconds % 60000) / 1000);

        // console.log(`Difference: ${differenceInMinutes} minutes and ${differenceInSeconds} seconds`);
        // timeFormat = `Difference: ${differenceInMinutes} minutes ${differenceInSeconds} seconds`;

    }

    console.log('data', data)
    return c.res({
        image: (
            <div
                style={{
                    alignItems: 'center',
                    background:
                        status === 'response'
                            ? 'linear-gradient(to right, #432889, #17101F)'
                            : 'black',
                    backgroundSize: '100% 100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    height: '100%',
                    justifyContent: 'center',
                    textAlign: 'center',
                    width: '100%',
                }}
            >
                <div
                    style={{
                        color: 'white',
                        fontSize: 60,
                        fontStyle: 'normal',
                        letterSpacing: '-0.025em',
                        lineHeight: 1.4,
                        marginTop: 30,
                        padding: '0 120px',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    {`Current Position Type: ${positionType}\nCurrent Position Size: ${positionSize} ${TOKEN_TICKER}\nTime Remaining: ${timeFormat}`}
                </div>
            </div>
        ),
        intents: [
            <Button action="/game">Refresh</Button>,
            <Button.Reset>Reset</Button.Reset>,
        ],
    })
})


devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
