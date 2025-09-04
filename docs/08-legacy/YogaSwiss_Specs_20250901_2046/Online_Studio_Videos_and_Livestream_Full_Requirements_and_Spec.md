# Online Studio — Videos and Livestream — Full Requirements and Spec

On demand video library and livestream with access control, uploads, and a great playback experience.

## Scope and Goals
* Simple upload and publish flow for instructors and admins
* Reliable playback on web and mobile with captions and chapters
* Clear access rules that align with passes and memberships

## Content Types
* Video on demand single class with duration, tags, and level
* Course or challenge with a sequence of videos and optional schedule
* Livestream sessions that can become recordings after the event
* Collections and playlists for discovery

## Upload and Transcode
* Upload large files with resumable uploads
* Transcode to multiple bitrates with HLS, create poster frames and thumbnails
* Generate captions with AI and allow manual edit

## Player Features
* Quality selector, skip forward and back, variable speed, picture in picture
* Chapters and markers, intro skip, resume from last position
* AirPlay and Chromecast where supported
* Captions and multiple audio tracks for languages

## Access Control
* Public, unlisted, or members only
* Entitlement by membership tag or by pass that includes online access
* Pay per view as an option with rental period
* Geo restriction optional

## Livestream
* Connect Zoom or native RTMP
* Waiting room, chat for attendees, and host controls
* Auto check in when the attendee joins from email link near start time
* Auto create a recording asset and attach it to the class or course

## Scheduling and Premieres
* Premiere a video at a future date with live chat and then move it to the library
* Series schedule for courses and challenges with reminders

## SEO and Delivery
* Public pages with structured data, share images, and human readable URLs
* CDN delivery with caching rules and signed URLs for protected content

## Data Model at a Glance
* videos with title_i18n, description_i18n, duration, tags, level, visibility, poster_url, hls_url, captions
* courses with name, description, locale, publish time
* course_items mapping to videos with order, release_time
* livestreams with start_at, link or RTMP keys, recording_asset_id
* entitlements that link products to videos or courses
* watch_history and progress per user
* comments or reviews with moderation

## Admin Experience
* Library list with filters by tag, level, length, publish status
* Upload wizard with progress and thumbnail editor
* Editor for metadata, captions, chapters, and access rules
* Link a video to a class template or product for cross sell

## Student Experience
* Video cards with clear access markers, continue watching row, playlists
* Player with chapters and captions and next up
* Bookmarks and favorites

## Analytics
* Plays, unique viewers, watch time, completion rate, top videos, churn risk based on engagement
* Livestream attendance and chat activity

## Quality and Acceptance
* Upload to publish in minutes with safe progress recovery
* Playback starts quickly and adapts to network conditions
* Access rules are enforced and watch history syncs across devices
