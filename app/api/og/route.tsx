import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse parameters
    const name = searchParams.get('name') || 'Choco Celia';
    const image = searchParams.get('image') || '';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#2B1712',
            backgroundImage: 'radial-gradient(circle, #46271D 0%, #2B1712 100%)',
            padding: '60px',
            position: 'relative',
          }}
        >
          {/* Decorative Gold Border */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              bottom: '20px',
              left: '20px',
              right: '20px',
              border: '2px solid #C89B67',
              borderRadius: '24px',
              opacity: 0.3,
            }}
          />

          {/* Left: Text Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              width: '55%',
              height: '100%',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#C89B67',
                letterSpacing: '3px',
                marginBottom: '20px',
                textTransform: 'uppercase',
              }}
            >
              Choco Celia
            </div>
            <div
              style={{
                fontSize: '56px',
                fontWeight: 'extrabold',
                color: '#FFF8EE',
                lineHeight: 1.2,
                marginBottom: '20px',
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontSize: '22px',
                color: '#E8C9BD',
                lineHeight: 1.5,
              }}
            >
              Experience the finest handmade chocolates, crafted with passion and premium ingredients.
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '40px',
              }}
            >
              <div
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#C89B67',
                  color: '#2B1712',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  borderRadius: '30px',
                }}
              >
                Order Online
              </div>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: '18px',
                  marginLeft: '20px',
                  opacity: 0.8,
                }}
              >
                توصيل داخل المحافظة وقريباً لجميع المحافظات
              </div>
            </div>
          </div>

          {/* Right: Image Container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40%',
              height: '100%',
            }}
          >
            {image ? (
              <img
                src={image}
                alt={name}
                style={{
                  width: '380px',
                  height: '380px',
                  borderRadius: '30px',
                  border: '6px solid #C89B67',
                  objectFit: 'cover',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '380px',
                  height: '380px',
                  borderRadius: '30px',
                  border: '6px dashed #C89B67',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '120px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                }}
              >
                🍫
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.error('OG image generation failed:', e);
    return new Response(`Failed to generate OG image`, { status: 500 });
  }
}
