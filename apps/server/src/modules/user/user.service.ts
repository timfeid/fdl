import { PrismaClient, User, Prisma } from '@prisma/client'
import { Service } from 'typedi'
import { PasswordService } from '../password/password.service'

@Service()
export class UserService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly passwordService: PasswordService,
  ) {}

  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: {
        provider: {
          include: {
            address: {
              include: {
                city: {
                  include: {
                    state: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  }

  async create(user: Prisma.UserCreateInput) {
    if (user.password) {
      user.password = await this.passwordService.encrypt(user.password)
    }

    return this.prisma.user.create({
      data: user,
    })
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    })
  }

  async update(user: User, data: Prisma.UserUpdateInput) {
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data,
    })
  }
}
