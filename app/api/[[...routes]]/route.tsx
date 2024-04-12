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

const TOKEN_TICKER = "$HUAT";

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
            <Button value="joinround" action="/pregame">Join Round</Button>,
            <Button value="profile" action="/profile">Profile</Button>,
        ]
    })
})

app.frame('/pregame', async (c) => {
    const { buttonValue, inputText, status } = c
    const price = await fetchTokenPrice("ETH");
    const { frameData } = c;
    const fid = frameData?.fid;

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
            <div style={{ display: "flex", height: "100%" }}>
                <div
                    style={{
                        color: 'black',
                        fontSize: 60,
                        fontStyle: 'normal',
                        letterSpacing: '-0.025em',
                        lineHeight: 1.4,
                        marginTop: 30,
                        padding: '0 120px',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    {`Current Ethereum Price: $${price}\nTime: ${new Date().toTimeString().split(' ')[0]}`}
                </div>
            </div>
        ),
        intents: [
            <TextInput placeholder={`Enter your position in ${TOKEN_TICKER}`} />,
            <Button value={PositionType.LONG} action="/game">Long</Button>,
            <Button value={PositionType.SHORT} action="/game">Short</Button>,
            <Button action="/pregame">Refresh</Button>,
            <Button.Reset>Reset</Button.Reset>,
        ]
    })
})


app.frame('/profile', async (c) => {
    const { status } = c
    const { fid } = c.frameData;

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
                    {`Balance of ${TOKEN_TICKER}: ${user?.balance} ${TOKEN_TICKER}\nTotal Trades: ${games?.length ?? 0}`}
                </div>
            </div>
        ),
        intents: [
            <Button action="/profile">Refresh</Button>,
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
